// scripts/debug_store_categories.js
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

const debug = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB\n');

        console.log('=== STORE CATEGORIES ===');
        const storeCategories = await StoreCategory.find({})
            .populate('masterCategoryId')
            .limit(10);

        if (storeCategories.length === 0) {
            console.log('No store categories found');
        } else {
            storeCategories.forEach((sc, idx) => {
                console.log(`\n${idx + 1}. StoreCategory: ${sc.name}`);
                console.log(`   Store ID: ${sc.storeId}`);
                console.log(`   Master Category ID: ${sc.masterCategoryId?._id}`);
                console.log(`   Master Category Name: ${sc.masterCategoryId?.name}`);
                console.log(`   Master Category Type: ${sc.masterCategoryId?.type || 'N/A'}`);
                console.log(`   Is Deprecated: ${sc.masterCategoryId?.isDeprecated || 'N/A'}`);
            });
        }

        console.log('\n\n=== MASTER CATEGORIES (Brands/Legacy) ===');
        const legacyCategories = await Category.find({ type: { $ne: 'product_category' } }).limit(5);
        legacyCategories.forEach(cat => {
            console.log(`- ${cat.name} (Type: ${cat.type || 'NONE'}, Deprecated: ${cat.isDeprecated})`);
        });

        console.log('\n\n=== BRANDS ===');
        const brands = await Brand.find({}).limit(5);
        brands.forEach(b => {
            console.log(`- ${b.name} (ID: ${b._id})`);
        });

        console.log('\n\n=== REAL CATEGORIES ===');
        const realCategories = await Category.find({ type: 'product_category' });
        realCategories.forEach(cat => {
            console.log(`- ${cat.name} (ID: ${cat._id})`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

debug();
