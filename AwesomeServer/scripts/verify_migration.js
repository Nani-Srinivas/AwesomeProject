// scripts/verify_migration.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Brand from '../src/models/Product/Brand.js';
import Category from '../src/models/Product/Category.js';
import Subcategory from '../src/models/Product/Subcategory.js';
import MasterProduct from '../src/models/Product/MasterProduct.js';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/GroceryApp';

const verify = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('\n--- 1. Brands (Migrated from old Categories) ---');
        const brands = await Brand.find({}).limit(5);
        if (brands.length === 0) console.log("No brands found!");
        brands.forEach(b => console.log(`Brand: ${b.name} (ID: ${b._id})`));

        console.log('\n--- 2. Real Categories (Standardized) ---');
        const categories = await Category.find({ type: 'product_category' });
        categories.forEach(c => console.log(`Category: ${c.name} (ID: ${c._id})`));

        console.log('\n--- 3. Global Subcategories ---');
        const subs = await Subcategory.find({ type: 'global_subcategory' }).limit(5);
        subs.forEach(s => console.log(`Subcategory: ${s.name} (Category: ${s.categoryId})`));

        console.log('\n--- 4. Products (Updated References) ---');
        const product = await MasterProduct.findOne({ brandId: { $ne: null } })
            .populate('brandId')
            .populate('category')
            .populate('subcategory');

        if (product) {
            console.log(`Product: ${product.name}`);
            console.log(` - Brand: ${product.brandId?.name}`);
            console.log(` - Category: ${product.category?.name}`);
            console.log(` - Subcategory: ${product.subcategory?.name}`);
            console.log(` - Legacy Category ID: ${product.legacyCategoryId}`);
        } else {
            console.log("No migrated products found.");
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

verify();
