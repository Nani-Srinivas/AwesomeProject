/**
 * Migration Script: Add storeBrandId to existing StoreProducts
 * 
 * This script fixes products created before the storeBrandId mapping was implemented.
 * It sets storeBrandId for:
 * 1. Products with masterProductId - looks up the brand from MasterProduct
 * 2. Products without masterProductId - requires manual intervention or remains null
 * 
 * Run with: node scripts/migrate_storebrand_ids.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import StoreProduct from '../src/models/Product/StoreProduct.js';
import MasterProduct from '../src/models/Product/MasterProduct.js';
import StoreBrand from '../src/models/Product/StoreBrand.js';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// MongoDB URI with fallback options
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/GroceryApp';

console.log('Environment loaded:', process.env.MONGO_URI ? '✅ MONGO_URI found' : '⚠️  MONGO_URI not found');

// MongoDB connection
const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const migrateStoreBrandIds = async () => {
    try {
        console.log('\n🔍 Starting migration: Add storeBrandId to StoreProducts...\n');

        // Find all products without storeBrandId
        const productsWithoutBrand = await StoreProduct.find({
            $or: [
                { storeBrandId: null },
                { storeBrandId: { $exists: false } }
            ]
        }).populate('masterProductId');

        console.log(`Found ${productsWithoutBrand.length} products without storeBrandId\n`);

        if (productsWithoutBrand.length === 0) {
            console.log('✅ All products already have storeBrandId set!');
            return;
        }

        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        // Process each product
        for (const product of productsWithoutBrand) {
            try {
                // Case 1: Product has masterProductId - we can look up the brand
                if (product.masterProductId && product.masterProductId.brandId) {
                    const masterBrandId = product.masterProductId.brandId;

                    // Find the corresponding StoreBrand
                    const storeBrand = await StoreBrand.findOne({
                        storeId: product.storeId,
                        masterBrandId: masterBrandId
                    });

                    if (storeBrand) {
                        // Update the product with storeBrandId
                        product.storeBrandId = storeBrand._id;
                        await product.save();

                        console.log(`✅ Updated: ${product.name} -> Brand: ${storeBrand.name}`);
                        updatedCount++;
                    } else {
                        console.log(`⚠️  Skipped: ${product.name} - StoreBrand not found for masterBrandId: ${masterBrandId}`);
                        skippedCount++;
                    }
                }
                // Case 2: Product without masterProductId (manually created)
                else {
                    console.log(`⚠️  Skipped: ${product.name} - No masterProductId (manually created, requires manual brand assignment)`);
                    skippedCount++;
                }
            } catch (error) {
                console.error(`❌ Error processing ${product.name}:`, error.message);
                errorCount++;
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 Migration Summary:');
        console.log('='.repeat(60));
        console.log(`Total products processed: ${productsWithoutBrand.length}`);
        console.log(`✅ Successfully updated: ${updatedCount}`);
        console.log(`⚠️  Skipped (needs manual intervention): ${skippedCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log('='.repeat(60) + '\n');

        if (skippedCount > 0) {
            console.log('💡 Note: Skipped products are manually created products without a master product.');
            console.log('   You can assign brands to these products manually via the app or admin panel.\n');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
};

// Dry run mode - preview changes without applying
const dryRun = async () => {
    try {
        console.log('\n🔍 DRY RUN MODE - No changes will be made\n');

        const productsWithoutBrand = await StoreProduct.find({
            $or: [
                { storeBrandId: null },
                { storeBrandId: { $exists: false } }
            ]
        }).populate('masterProductId');

        console.log(`Found ${productsWithoutBrand.length} products without storeBrandId\n`);

        let canUpdate = 0;
        let needsManual = 0;

        for (const product of productsWithoutBrand) {
            if (product.masterProductId && product.masterProductId.brandId) {
                const storeBrand = await StoreBrand.findOne({
                    storeId: product.storeId,
                    masterBrandId: product.masterProductId.brandId
                });

                if (storeBrand) {
                    console.log(`✅ Can update: ${product.name} -> ${storeBrand.name}`);
                    canUpdate++;
                } else {
                    console.log(`❌ Cannot update: ${product.name} - StoreBrand not found`);
                    needsManual++;
                }
            } else {
                console.log(`⚠️  Manual intervention: ${product.name} - No masterProductId`);
                needsManual++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`Products that can be auto-updated: ${canUpdate}`);
        console.log(`Products needing manual intervention: ${needsManual}`);
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Dry run failed:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    await connectDB();

    // Check command line arguments
    const isDryRun = process.argv.includes('--dry-run');

    if (isDryRun) {
        await dryRun();
    } else {
        console.log('💡 Tip: Run with --dry-run flag to preview changes first\n');
        await migrateStoreBrandIds();
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
};

// Run the script
main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
