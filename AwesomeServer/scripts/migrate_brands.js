// scripts/migrate_brands.js
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
import Brand from '../src/models/Product/Brand.js';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/GroceryApp';

const migrateBrands = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('Starting migration: Categories -> Brands');

        // Fetch all existing categories
        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories to migrate.`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const cat of categories) {
            // Check if Brand already exists (idempotency)
            const existingBrand = await Brand.findOne({ name: cat.name });

            if (existingBrand) {
                console.log(`Brand "${cat.name}" already exists. Skipping.`);
                skippedCount++;
                continue;
            }

            // Create new Brand
            const newBrand = new Brand({
                _id: new mongoose.Types.ObjectId(), // Create new ID for Brand, or could try to keep old one but safer to new
                name: cat.name,
                description: cat.description,
                imageUrl: cat.imageUrl,
                createdBy: cat.createdBy,
                createdByModel: cat.createdByModel,
                createdAt: cat.createdAt,
                updatedAt: cat.updatedAt
            });

            await newBrand.save();

            // OPTIONAL: If we want to store the mapping for later use in a temp collection or just log it
            // For now, we rely on name matching or subsequent scripts looking up by name if needed, 
            // BUT actually for product migration we definitely need the mapping.
            // So let's store the old Category ID on the Brand for reference (temp field)?
            // Or better, since we can't easily modify the Brand schema just for migration without making it dirty,
            // let's trust that we can lookup by Name since names are unique.

            console.log(`Migrated: ${cat.name}`);
            migratedCount++;
        }

        console.log(`Migration completed. Migrated: ${migratedCount}, Skipped: ${skippedCount}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};

migrateBrands();
