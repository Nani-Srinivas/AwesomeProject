// scripts/migrate_subcategories.js
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
import Subcategory from '../src/models/Product/Subcategory.js';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/GroceryApp';

const migrateSubcategories = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('Starting migration: Subcategories Normalization');

        // 1. Mark ALL existing subcategories as legacy
        // Similar to Categories, we assume everything existing is legacy brand-specific.
        // Exclude 'global_subcategory' if any exist (e.g. re-run).
        await Subcategory.updateMany(
            { type: { $ne: 'global_subcategory' } },
            { $set: { type: 'brand_legacy', isDeprecated: true } }
        );
        console.log('Marked existing subcategories as legacy.');

        // 2. Fetch "Dairy" Category ID (Assuming user said mostly Dairy)
        const dairyCategory = await Category.findOne({ name: 'Dairy', type: 'product_category' });
        if (!dairyCategory) {
            throw new Error('Dairy category not found! Run migrate_categories.js first.');
        }

        // 3. Find unique names from Legacy Subcategories
        // We want to create global versions of these.
        const legacySubs = await Subcategory.find({ type: 'brand_legacy' });
        const uniqueNames = [...new Set(legacySubs.map(s => s.name))];
        console.log(`Found ${uniqueNames.length} unique subcategory names to normalize.`);

        // Quick hack for Creator ID
        const someLegacySub = legacySubs[0];
        const fallbackCreator = someLegacySub ? someLegacySub.createdBy : new mongoose.Types.ObjectId();
        const fallbackModel = someLegacySub ? someLegacySub.createdByModel : 'Admin';

        for (const name of uniqueNames) {
            // Create global subcategory attached to Dairy
            // Note: If we had multiple Categories, we'd need logic here. 
            // For MVP "Dairy Only", this is safe-ish.

            const existing = await Subcategory.findOne({
                name: name,
                categoryId: dairyCategory._id,
                type: 'global_subcategory'
            });

            if (!existing) {
                await Subcategory.create({
                    name: name,
                    categoryId: dairyCategory._id,
                    type: 'global_subcategory',
                    isDeprecated: false,
                    createdBy: fallbackCreator,
                    createdByModel: fallbackModel
                });
                console.log(`Created global subcategory: ${name} (Dairy)`);
            } else {
                console.log(`Global subcategory ${name} already exists.`);
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

migrateSubcategories();
