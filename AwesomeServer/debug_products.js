import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StoreProduct from './src/models/Product/StoreProduct.js';
import Store from './src/models/Store/Store.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const store = await Store.findOne({ name: /Nanditha/i });
        if (!store) {
            console.log('Store "Nanditha dairy" not found.');
            return;
        }

        console.log(`Store Found: ${store.name} (${store._id})`);

        const products = await StoreProduct.find({ storeId: store._id });
        console.log(`Found ${products.length} products.`);

        products.forEach(p => {
            console.log(`"${p.name}"`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
