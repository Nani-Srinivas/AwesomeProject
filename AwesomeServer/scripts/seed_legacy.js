// scripts/seed_legacy.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import Category from '../src/models/Product/Category.js';
import Subcategory from '../src/models/Product/Subcategory.js';
import MasterProduct from '../src/models/Product/MasterProduct.js';
import Brand from '../src/models/Product/Brand.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/GroceryApp';

const seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing to start fresh
        await Category.deleteMany({});
        await Subcategory.deleteMany({});
        await MasterProduct.deleteMany({});
        await Brand.deleteMany({});

        // 1. Create Legacy Categories (Actually Brands)
        const amul = await Category.create({
            name: 'Amul',
            description: 'Legacy Brand Amul',
            imageUrl: 'amul.png',
            createdBy: new mongoose.Types.ObjectId(),
            createdByModel: 'Admin'
            // type defaults to 'product_category' in schema now, but we want to simulate old state.
            // But wait, schema has default. We should manually set it if we can, or just let migration script handle it.
            // Migration script checks: `type: { $ne: 'product_category' }`. 
            // So we MUST set it to something else or just rely on the fact that existing OLD data wouldn't have the field.
            // But here we are inserting NEW data.
            // The schema `default: 'product_category'` will apply.
            // So my migration script `migrate_categories.js` logic: `updateMany({ type: { $ne: 'product_category' } }...)` will FAIL on these new docs.
            // I should force them to be "legacy" or "undefined".
            // Mongoose might force default.
            // Let's explicitly set type to null if allowed, or just update it after creation using lean/updateOne to simulate "missing field".
        });
        // Hack: Unset the type field to simulate old data
        await Category.updateOne({ _id: amul._id }, { $unset: { type: 1 } });

        const jersey = await Category.create({
            name: 'Jersey',
            description: 'Legacy Brand Jersey',
            createdBy: new mongoose.Types.ObjectId(),
            createdByModel: 'Admin'
        });
        await Category.updateOne({ _id: jersey._id }, { $unset: { type: 1 } });


        // 2. Create Legacy Subcategories (Duplicated per Brand)
        const amulMilk = await Subcategory.create({
            name: 'Milk',
            categoryId: amul._id,
            createdBy: new mongoose.Types.ObjectId(),
            createdByModel: 'Admin'
        });
        await Subcategory.updateOne({ _id: amulMilk._id }, { $unset: { type: 1 } });

        const jerseyMilk = await Subcategory.create({
            name: 'Milk',
            categoryId: jersey._id,
            createdBy: new mongoose.Types.ObjectId(),
            createdByModel: 'Admin'
        });
        await Subcategory.updateOne({ _id: jerseyMilk._id }, { $unset: { type: 1 } });


        // 3. Create Product linked to Legacy
        await MasterProduct.create({
            name: 'Amul Gold Milk',
            basePrice: 50,
            category: amul._id, // Points to "Amul"
            subcategory: amulMilk._id, // Points to "Milk" (Amul version)
            createdBy: new mongoose.Types.ObjectId(),
            createdByModel: 'Admin'
        });

        console.log('Seeded Legacy Data: Amul, Jersey, Milk (x2), Product (Amul Gold)');

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

seed();
