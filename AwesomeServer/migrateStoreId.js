// Migration script to add storeId to existing records
import "dotenv/config.js";
import mongoose from "mongoose";
import Area from "./src/models/Delivery/Area.js";
import { AttendanceLog } from "./src/models/AttendanceLog.js";
import Stock from "./src/models/Store/Stock.js";
import Vendor from "./src/models/Vendor.js";
import { StoreManager } from "./src/models/User/StoreManager.js";
import Store from "./src/models/Store/Store.js";
import DeliveryBoy from "./src/models/Delivery/DeliveryBoy.js";

async function migrateStoreId() {
    console.log('Starting storeId migration...\n');

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Migration statistics
        const stats = {
            areas: { total: 0, migrated: 0, skipped: 0, errors: 0 },
            vendors: { total: 0, migrated: 0, skipped: 0, errors: 0 },
            stocks: { total: 0, migrated: 0, skipped: 0, errors: 0 },
            attendanceLogs: { total: 0, migrated: 0, skipped: 0, errors: 0 },
            deliveryBoys: { total: 0, migrated: 0, skipped: 0, errors: 0 },
        };

        // ==================== MIGRATE AREAS ====================
        console.log('📍 Migrating Areas...');
        const areas = await Area.find({});
        stats.areas.total = areas.length;

        for (const area of areas) {
            try {
                if (area.storeId) {
                    stats.areas.skipped++;
                    continue;
                }

                // Get storeId from createdBy manager
                const manager = await StoreManager.findById(area.createdBy);
                if (!manager) {
                    // Try finding store directly if createdBy is not a StoreManager (legacy data?)
                    // Or skip
                    console.log(`  ⚠️  Area "${area.name}" - No manager found for createdBy ${area.createdBy}`);
                    stats.areas.errors++;
                    continue;
                }

                const store = await Store.findOne({ ownerId: manager._id });
                if (!store) {
                    console.log(`  ⚠️  Area "${area.name}" - No store found for manager ${manager.name}`);
                    stats.areas.errors++;
                    continue;
                }

                area.storeId = store._id;
                await area.save();
                stats.areas.migrated++;
                console.log(`  ✅ Area "${area.name}" → Store ${store._id}`);
            } catch (error) {
                console.error(`  ❌ Error migrating area "${area.name}":`, error.message);
                stats.areas.errors++;
            }
        }

        // ==================== MIGRATE VENDORS ====================
        console.log('\n🏪 Migrating Vendors...');
        const vendors = await Vendor.find({});
        stats.vendors.total = vendors.length;

        for (const vendor of vendors) {
            try {
                if (vendor.storeId) {
                    stats.vendors.skipped++;
                    continue;
                }

                // Try to get storeId from assigned categories
                if (vendor.assignedCategories && vendor.assignedCategories.length > 0) {
                    const { default: StoreCategory } = await import('./src/models/Product/StoreCategory.js');
                    const category = await StoreCategory.findById(vendor.assignedCategories[0]);

                    if (category && category.storeId) {
                        vendor.storeId = category.storeId;
                        await vendor.save();
                        stats.vendors.migrated++;
                        console.log(`  ✅ Vendor "${vendor.name}" → Store ${category.storeId}`);
                        continue;
                    }
                }

                console.log(`  ⚠️  Vendor "${vendor.name}" - No store found, needs manual assignment`);
                stats.vendors.errors++;
            } catch (error) {
                console.error(`  ❌ Error migrating vendor "${vendor.name}":`, error.message);
                stats.vendors.errors++;
            }
        }

        // ==================== MIGRATE STOCKS ====================
        console.log('\n📦 Migrating Stock Records...');
        const stocks = await Stock.find({});
        stats.stocks.total = stocks.length;

        for (const stock of stocks) {
            try {
                if (stock.storeId) {
                    stats.stocks.skipped++;
                    continue;
                }

                // Get storeId from createdBy manager
                const manager = await StoreManager.findById(stock.createdBy);
                if (!manager) {
                    console.log(`  ⚠️  Stock record - No manager found`);
                    stats.stocks.errors++;
                    continue;
                }

                const store = await Store.findOne({ ownerId: manager._id });
                if (!store) {
                    console.log(`  ⚠️  Stock record - No store found for manager`);
                    stats.stocks.errors++;
                    continue;
                }

                stock.storeId = store._id;
                await stock.save();
                stats.stocks.migrated++;
                console.log(`  ✅ Stock record → Store ${store._id}`);
            } catch (error) {
                console.error(`  ❌ Error migrating stock:`, error.message);
                stats.stocks.errors++;
            }
        }

        // ==================== MIGRATE ATTENDANCE LOGS ====================
        console.log('\n✅ Migrating Attendance Logs...');
        const attendanceLogs = await AttendanceLog.find({});
        stats.attendanceLogs.total = attendanceLogs.length;

        for (const log of attendanceLogs) {
            try {
                if (log.storeId) {
                    stats.attendanceLogs.skipped++;
                    continue;
                }

                // Get storeId from area
                const area = await Area.findById(log.areaId);
                if (!area || !area.storeId) {
                    console.log(`  ⚠️  Attendance log - No store found for area`);
                    stats.attendanceLogs.errors++;
                    continue;
                }

                log.storeId = area.storeId;
                await log.save();
                stats.attendanceLogs.migrated++;
                console.log(`  ✅ Attendance log (${log.date.toDateString()}) → Store ${area.storeId}`);
            } catch (error) {
                console.error(`  ❌ Error migrating attendance log:`, error.message);
                stats.attendanceLogs.errors++;
            }
        }

        // ==================== MIGRATE DELIVERY BOYS ====================
        console.log('\n🚚 Migrating Delivery Boys...');
        const deliveryBoys = await DeliveryBoy.find({});
        stats.deliveryBoys.total = deliveryBoys.length;

        for (const db of deliveryBoys) {
            try {
                if (db.storeId) {
                    stats.deliveryBoys.skipped++;
                    continue;
                }

                // Get storeId from createdBy manager
                const manager = await StoreManager.findById(db.createdBy);
                if (!manager) {
                    console.log(`  ⚠️  Delivery Boy "${db.name}" - No manager found`);
                    stats.deliveryBoys.errors++;
                    continue;
                }

                const store = await Store.findOne({ ownerId: manager._id });
                if (!store) {
                    console.log(`  ⚠️  Delivery Boy "${db.name}" - No store found for manager`);
                    stats.deliveryBoys.errors++;
                    continue;
                }

                db.storeId = store._id;
                await db.save();
                stats.deliveryBoys.migrated++;
                console.log(`  ✅ Delivery Boy "${db.name}" → Store ${store._id}`);
            } catch (error) {
                console.error(`  ❌ Error migrating delivery boy "${db.name}":`, error.message);
                stats.deliveryBoys.errors++;
            }
        }

        // ==================== SUMMARY ====================
        console.log('\n' + '='.repeat(60));
        console.log('📊 MIGRATION SUMMARY');
        console.log('='.repeat(60));

        Object.entries(stats).forEach(([model, counts]) => {
            console.log(`\n${model.toUpperCase()}:`);
            console.log(`  Total:    ${counts.total}`);
            console.log(`  Migrated: ${counts.migrated} ✅`);
            console.log(`  Skipped:  ${counts.skipped} (already had storeId)`);
            console.log(`  Errors:   ${counts.errors} ❌`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('✅ Migration completed!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
    }
}

migrateStoreId();
