// scripts/debug_products.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import MasterProduct from '../src/models/Product/MasterProduct.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/GroceryApp';

const debug = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const count = await MasterProduct.countDocuments();
        console.log(`Total MasterProducts: ${count}`);

        if (count > 0) {
            const p = await MasterProduct.findOne().lean();
            console.log('Sample Product:', JSON.stringify(p, null, 2));
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

debug();
