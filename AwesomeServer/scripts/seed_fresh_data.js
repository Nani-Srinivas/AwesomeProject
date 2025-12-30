// scripts/seed_fresh_data.js
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
import Admin from '../src/models/User/Admin.js';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/GroceryApp';

const seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Create a dummy admin user for createdBy references
        let admin = await Admin.findOne({ email: 'admin@grocery.com' });
        if (!admin) {
            admin = await Admin.create({
                name: 'System Admin',
                email: 'admin@grocery.com',
                password: 'admin123', // Change this!
                roles: ['Admin']
            });
            console.log('✅ Created admin user: admin@grocery.com / admin123\n');
        }

        const adminId = admin._id;

        // 1. Create Brands
        console.log('Creating Brands...');
        const amul = await Brand.create({
            name: 'Amul',
            description: 'Indian dairy cooperative',
            imageUrl: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png',
            createdBy: adminId,
            createdByModel: 'Admin'
        });

        const heritage = await Brand.create({
            name: 'Heritage',
            description: 'South Indian dairy brand',
            createdBy: adminId,
            createdByModel: 'Admin'
        });

        const nestle = await Brand.create({
            name: 'Nestle',
            description: 'Global food and beverage company',
            createdBy: adminId,
            createdByModel: 'Admin'
        });

        console.log(`✅ Created 3 brands: Amul, Heritage, Nestle\n`);

        // 2. Create Categories
        console.log('Creating Categories...');
        const dairy = await Category.create({
            name: 'Dairy',
            description: 'Milk, yogurt, cheese, butter products',
            type: 'product_category',
            createdBy: adminId,
            createdByModel: 'Admin'
        });

        const beverages = await Category.create({
            name: 'Beverages',
            description: 'Juices, soft drinks, health drinks',
            type: 'product_category',
            createdBy: adminId,
            createdByModel: 'Admin'
        });

        console.log(`✅ Created 2 categories: Dairy, Beverages\n`);

        // 3. Create Subcategories
        console.log('Creating Subcategories...');
        const milk = await Subcategory.create({
            name: 'Milk',
            categoryId: dairy._id,
            type: 'global_subcategory',
            createdBy: adminId,
            createdByModel: 'Admin'
        });

        const yogurt = await Subcategory.create({
            name: 'Yogurt',
            categoryId: dairy._id,
            type: 'global_subcategory',
            createdBy: adminId,
            createdByModel: 'Admin'
        });

        const juice = await Subcategory.create({
            name: 'Juice',
            categoryId: beverages._id,
            type: 'global_subcategory',
            createdBy: adminId,
            createdByModel: 'Admin'
        });

        const softDrinks = await Subcategory.create({
            name: 'Soft Drinks',
            categoryId: beverages._id,
            type: 'global_subcategory',
            createdBy: adminId,
            createdByModel: 'Admin'
        });

        console.log(`✅ Created 4 subcategories\n`);

        // 4. Create Master Products
        console.log('Creating Master Products...');

        const products = [
            // Amul Dairy
            { name: 'Amul Gold Milk', brandId: amul._id, category: dairy._id, subcategory: milk._id, basePrice: 50 },
            { name: 'Amul Taaza Milk', brandId: amul._id, category: dairy._id, subcategory: milk._id, basePrice: 45 },
            { name: 'Amul Masti Dahi', brandId: amul._id, category: dairy._id, subcategory: yogurt._id, basePrice: 30 },

            // Heritage Dairy
            { name: 'Heritage Slim Milk', brandId: heritage._id, category: dairy._id, subcategory: milk._id, basePrice: 48 },
            { name: 'Heritage Toned Milk', brandId: heritage._id, category: dairy._id, subcategory: milk._id, basePrice: 42 },
            { name: 'Heritage Curd', brandId: heritage._id, category: dairy._id, subcategory: yogurt._id, basePrice: 28 },

            // Nestle Beverages
            { name: 'Nestle Mango Juice', brandId: nestle._id, category: beverages._id, subcategory: juice._id, basePrice: 35 },
            { name: 'Nestle Orange Juice', brandId: nestle._id, category: beverages._id, subcategory: juice._id, basePrice: 35 },
        ];

        for (const productData of products) {
            await MasterProduct.create({
                ...productData,
                createdBy: adminId,
                createdByModel: 'Admin'
            });
        }

        console.log(`✅ Created ${products.length} master products\n`);

        console.log('\n========================================');
        console.log('✅ SEED DATA COMPLETE!');
        console.log('========================================\n');
        console.log('What was created:');
        console.log(`- 3 Brands: Amul, Heritage, Nestle`);
        console.log(`- 2 Categories: Dairy, Beverages`);
        console.log(`- 4 Subcategories: Milk, Yogurt, Juice, Soft Drinks`);
        console.log(`- ${products.length} Master Products`);
        console.log(`\nAdmin Login: admin@grocery.com / admin123`);
        console.log(`AdminJS: http://localhost:3000/admin\n`);

    } catch (error) {
        console.error('Seed failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

seed();
