// scripts/migrate_store_categories_to_brands.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import StoreCategory from '../src/models/Product/StoreCategory.js';
import Category from '../src/models/Product/Category.js';
import Brand from '../src/models/Product/Brand.js';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/GroceryApp';

const migrate = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB\n');

        console.log('=== Migrating StoreCategories to use Brand instead of brand_legacy Category ===\n');

        // Get all store categories
        const storeCategories = await StoreCategory.find({}).populate('masterCategoryId');

        let updated = 0;
        let skipped = 0;
        let failed = 0;

        for (const storeCat of storeCategories) {
            const legacyCategory = storeCat.masterCategoryId;

            if (!legacyCategory) {
                console.log(`⚠️  StoreCategory "${storeCat.name}" has no masterCategoryId - skipping`);
                skipped++;
                continue;
            }

            // Check if this is a brand_legacy category
            if (legacyCategory.type === 'brand_legacy') {
                // Find the corresponding Brand by name
                const brand = await Brand.findOne({ name: legacyCategory.name });

                if (brand) {
                    console.log(`✅ Updating "${storeCat.name}" (Store: ${storeCat.storeId})`);
                    console.log(`   From: brand_legacy Category "${legacyCategory.name}" (${legacyCategory._id})`);
                    console.log(`   To: Brand "${brand.name}" (${brand._id})\n`);

                    // Update the masterCategoryId to point to the Brand
                    // NOTE: This is a semantic mismatch (masterCategoryId pointing to Brand)
                    // But it maintains backward compatibility with existing schema
                    await StoreCategory.updateOne(
                        { _id: storeCat._id },
                        { masterCategoryId: brand._id }
                    );
                    updated++;
                } else {
                    console.log(`❌ No Brand found for "${legacyCategory.name}" - skipping\n`);
                    failed++;
                }
            } else {
                console.log(`⏭️  StoreCategory "${storeCat.name}" already uses non-legacy category - skipping`);
                skipped++;
            }
        }

        console.log('\n=== Migration Summary ===');
        console.log(`Total StoreCategories: ${storeCategories.length}`);
        console.log(`Updated: ${updated}`);
        console.log(`Skipped: ${skipped}`);
        console.log(`Failed: ${failed}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

migrate();
