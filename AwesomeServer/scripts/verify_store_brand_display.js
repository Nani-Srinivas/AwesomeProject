// scripts/verify_store_brand_display.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import StoreCategory from '../src/models/Product/StoreCategory.js';
import StoreSubcategory from '../src/models/Product/StoreSubcategory.js';
import StoreProduct from '../src/models/Product/StoreProduct.js';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/GroceryApp';

const verify = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Simulate what the API returns
        console.log('=== SIMULATING API: GET /store/categories ===\n');

        const storeCategories = await StoreCategory.find({})
            .populate('masterCategoryId')
            .limit(5);

        const enrichedCategories = storeCategories.map(cat => {
            const categoryObj = cat.toObject();

            // Enrich with imageUrl from masterCategory if missing
            if (!categoryObj.imageUrl && categoryObj.masterCategoryId?.imageUrl) {
                categoryObj.imageUrl = categoryObj.masterCategoryId.imageUrl;
            }

            return categoryObj;
        });

        console.log('Categories returned to frontend:');
        enrichedCategories.forEach((cat, idx) => {
            console.log(`\n${idx + 1}. ${cat.name}`);
            console.log(`   ID: ${cat._id}`);
            console.log(`   Store: ${cat.storeId}`);
            console.log(`   MasterCategory (NOW BRAND): ${cat.masterCategoryId?.name}`);
            console.log(`   ImageURL: ${cat.imageUrl || 'N/A'}`);
            console.log(`   ✅ Type: This is a BRAND (was: ${cat.masterCategoryId?.type || 'N/A'})`);
        });

        console.log('\n\n=== TESTING SUBCATEGORY FILTER ===');
        if (storeCategories.length > 0) {
            const firstCategory = storeCategories[0];
            console.log(`\nFetching subcategories for: ${firstCategory.name}`);

            const subcategories = await StoreSubcategory.find({
                storeCategoryId: firstCategory._id
            });

            if (subcategories.length > 0) {
                console.log(`Found ${subcategories.length} subcategories:`);
                subcategories.forEach(sub => {
                    console.log(`  - ${sub.name}`);
                });
            } else {
                console.log('  ⚠️  No subcategories found for this brand');
            }

            console.log('\n=== TESTING PRODUCT FILTER ===');
            const products = await StoreProduct.find({
                storeCategoryId: firstCategory._id
            }).limit(5);

            if (products.length > 0) {
                console.log(`Found ${products.length} products for brand "${firstCategory.name}":`);
                products.forEach(p => {
                    console.log(`  - ${p.name} (₹${p.sellingPrice || p.costPrice})`);
                });
            } else {
                console.log('  ⚠️  No products found for this brand');
            }
        }

        console.log('\n\n=== EXPECTED FRONTEND BEHAVIOR ===');
        console.log('✅ ProductsScreen should show BRAND names (Amul, Heritage, TS Vijaya)');
        console.log('✅ Selecting a brand filters subcategories for that brand');
        console.log('✅ Selecting a subcategory filters products');
        console.log('\nIf you still see "Dairy" instead of brands, the frontend might be caching old data.');

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

verify();
