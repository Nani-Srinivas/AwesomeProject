// scripts/migrate_categories.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import Category from '../src/models/Product/Category.js';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/GroceryApp';

const migrateCategories = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('Starting migration: Categories Normalization');

        // 1. Mark ALL existing categories (which are actually brands) as legacy
        // We assume any category WITHOUT a 'type' field or with type 'product_category' but clearly a brand name is legacy.
        // However, since we JUST added the field default 'product_category', existing docs won't have it set in DB yet (unless accessed+saved).
        // Better to updateMany where type is NOT 'product_category' OR everything created before now.
        // simpler: update ALL properly.
        // Wait, if I run this twice, I don't want to mark "Dairy" as legacy.

        // safe bet: Find all categories that do NOT have the names of our new standard categories.
        // OR: check if name is in the list of known brands? No.
        // Strategy: Since we haven't created "Dairy" etc yet, EVERYTHING currently in DB is legacy.
        // We should look for documents where `type` is missing or is not 'product_category' (though default applies on fetch).
        // Actually, updateMany with $set: { type: 'brand_legacy', isDeprecated: true } 
        // BUT exclude ones that are already 'product_category' (if we ran this script partially).

        const updateResult = await Category.updateMany(
            { type: { $ne: 'product_category' }, name: { $nin: ['Dairy', 'Grocery', 'Vegetables', 'Fruits'] } },
            { $set: { type: 'brand_legacy', isDeprecated: true } }
        );
        console.log(`Marked ${updateResult.modifiedCount} old categories as legacy.`);

        // 2. Create Standard Categories
        const standardCategories = [
            { name: 'Dairy', description: 'Milk, Curd, Paneer, etc.' },
            { name: 'Grocery', description: 'Daily essentials' },
            { name: 'Vegetables', description: 'Fresh vegetables' },
            { name: 'Fruits', description: 'Fresh fruits' }
        ];

        // We need a dummy admin ID for 'createdBy'. Ideally fetch a real admin.
        // For script purpose, we might need to hardcode or fetch one.
        // Let's try to find an Admin.
        const Admin = mongoose.model('Admin', new mongoose.Schema({})); // minimal schema just to query if needed, or query direct collection
        // Actually, let's just use a hardcoded fallback or try to find one.
        // If not strict, maybe just generate a new ID? But validation says `required: true`.

        // Quick hack: Use the ID from one of the legacy categories to satisfy the requirement if we can't find an admin.
        const someLegacyCat = await Category.findOne();
        const fallbackCreator = someLegacyCat ? someLegacyCat.createdBy : new mongoose.Types.ObjectId();
        const fallbackModel = someLegacyCat ? someLegacyCat.createdByModel : 'Admin';

        for (const cat of standardCategories) {
            const existing = await Category.findOne({ name: cat.name });
            if (!existing) {
                await Category.create({
                    name: cat.name,
                    description: cat.description,
                    type: 'product_category',
                    isDeprecated: false,
                    createdBy: fallbackCreator,
                    createdByModel: fallbackModel
                });
                console.log(`Created category: ${cat.name}`);
            } else {
                console.log(`Category ${cat.name} already exists.`);
            }
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};

migrateCategories();
