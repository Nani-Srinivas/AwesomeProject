// scripts/migrate_products.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import MasterProduct from '../src/models/Product/MasterProduct.js';
import Category from '../src/models/Product/Category.js';
import Subcategory from '../src/models/Product/Subcategory.js';
import Brand from '../src/models/Product/Brand.js';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/GroceryApp';

const migrateProducts = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log('Starting migration: MasterProducts');

        const products = await MasterProduct.find({});
        console.log(`Found ${products.length} products to migrate.`);

        // Cache standard categories and brands
        const dairyCategory = await Category.findOne({ name: 'Dairy', type: 'product_category' });
        if (!dairyCategory) throw new Error("Dairy Category not found");

        const brands = await Brand.find({});
        const brandMap = new Map(brands.map(b => [b.name, b._id])); // Map Name -> ID

        // We need to look up Brand by ID, because `product.category` currently points to the Old Category ID (which matches Brand Name).
        // Wait, the currently stored `category` is an ObjectId pointing to the Category Collection.
        // The Category Collection document has a Name (e.g. "Amul").
        // We migrated that document to Brand Collection, where it has a Name "Amul" and a NEW ID (or same ID if we forced it, but we created new).
        // So:
        // 1. Get `product.category` (ObjectId).
        // 2. Find the *Legacy* Category document with that ID.
        // 3. Get its Name ("Amul").
        // 4. Find the Brand with that Name ("Amul"). Retrieve new `BrandId`.

        // Subcategories:
        // 1. Get `product.subcategory` (ObjectId).
        // 2. Find *Legacy* Subcategory doc.
        // 3. Get its Name ("Milk").
        // 4. Find *Global* Subcategory with Name "Milk" and Category "Dairy". Retrieve new `SubcategoryId`.

        let updatedCount = 0;

        for (const prod of products) {
            if (prod.brandId) {
                console.log(`Product ${prod.name} already migrated.`);
                continue;
            }

            // Step 1: Resolve Brand
            let brandId = null;
            if (prod.category) {
                const legacyCatDoc = await Category.findById(prod.category);
                if (legacyCatDoc) {
                    // It's a legacy category (Brand)
                    const brandName = legacyCatDoc.name;
                    if (brandMap.has(brandName)) {
                        brandId = brandMap.get(brandName);
                    }
                }
            }

            // Step 2: Resolve Global Subcategory
            let newSubId = null;
            if (prod.subcategory) {
                const legacySubDoc = await Subcategory.findById(prod.subcategory);
                if (legacySubDoc) {
                    const subName = legacySubDoc.name;
                    const globalSub = await Subcategory.findOne({
                        name: subName,
                        categoryId: dairyCategory._id,
                        type: 'global_subcategory'
                    });
                    if (globalSub) {
                        newSubId = globalSub._id;
                    }
                }
            }

            // Update Product
            if (brandId || newSubId) {
                // Prepare update object
                const update = {
                    legacyCategoryId: prod.category,
                    legacySubCategoryId: prod.subcategory,
                    category: dairyCategory._id, // Set to real category (Dairy)
                };

                if (brandId) update.brandId = brandId;
                if (newSubId) update.subcategory = newSubId;

                await MasterProduct.updateOne({ _id: prod._id }, { $set: update });
                updatedCount++;
                // console.log(`Migrated Product: ${prod.name}`);
            } else {
                console.warn(`Could not resolve brand/sub for product: ${prod.name}`);
            }
        }

        console.log(`Migration completed. Updated ${updatedCount} products.`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};

migrateProducts();
