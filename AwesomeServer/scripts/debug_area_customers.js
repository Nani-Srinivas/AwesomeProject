
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Customer } from '../src/models/User/Customer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/GroceryApp';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const targetAreaId = '6950fbc5b9e8946d692d8d8a';
        console.log(`Searching for customers with area ID: ${targetAreaId}`);

        const customers = await Customer.find({ area: targetAreaId });
        console.log(`Found ${customers.length} customers for this area.`);

        if (customers.length === 0) {
            console.log('No customers found. Sampling 5 arbitrary customers to inspect their area IDs:');
            const sample = await Customer.find({}).limit(5).select('name area');
            sample.forEach(c => {
                console.log(`- ${c.name}: ${c.area}`);
            });
        } else {
            console.log('Sample found:', customers[0].name);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
