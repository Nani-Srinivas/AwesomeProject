import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Models
import Store from '../src/models/Store/Store.js';
import StoreProduct from '../src/models/Product/StoreProduct.js';
import MasterProduct from '../src/models/Product/MasterProduct.js';
import Brand from '../src/models/Product/Brand.js';
import StoreBrand from '../src/models/Product/StoreBrand.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const syncStoreBrands = async () => {
    try {
        await connectDB();

        console.log('Starting StoreBrand Sync...');

        const stores = await Store.find({});
        console.log(`Found ${stores.length} stores to process.`);

        for (const store of stores) {
            const storeId = store._id;
            const ownerId = store.ownerId; // StoreManager ID

            console.log(`Processing Store: ${store.name} (${storeId})`);

            // Find all StoreProducts to identify which brands should exist
            const storeProducts = await StoreProduct.find({ storeId });
            const masterProductIds = storeProducts.map(sp => sp.masterProductId).filter(Boolean);

            if (masterProductIds.length === 0) {
                console.log(`  No products found for store ${store.name}. Skipping.`);
                continue;
            }

            const masterProducts = await MasterProduct.find({ _id: { $in: masterProductIds } });

            // Extract unique Brand IDs
            const masterBrandIds = [...new Set(masterProducts.map(p => p.brandId?.toString()).filter(Boolean))];

            if (masterBrandIds.length === 0) {
                console.log(`  No brands found explicitly in products for store ${store.name}.`);
                continue;
            }

            const masterBrands = await Brand.find({ _id: { $in: masterBrandIds } });

            let createdCount = 0;
            for (const masterBrand of masterBrands) {
                const existing = await StoreBrand.findOne({ storeId, masterBrandId: masterBrand._id });
                if (!existing) {
                    await StoreBrand.create({
                        storeId,
                        masterBrandId: masterBrand._id,
                        name: masterBrand.name,
                        description: masterBrand.description,
                        imageUrl: masterBrand.imageUrl,
                        createdBy: ownerId,
                        createdByModel: 'StoreManager',
                        isActive: true
                    });
                    createdCount++;
                    console.log(`  Created StoreBrand: ${masterBrand.name}`);
                }
            }
            console.log(`  Synced ${createdCount} brands for store ${store.name}.`);
        }

        console.log('StoreBrand Sync Completed Successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Script Error:', error);
        process.exit(1);
    }
};

syncStoreBrands();
