import dotenv from 'dotenv';
import Area from './src/models/Delivery/Area.js';
import { Customer } from './src/models/User/Customer.js';
import { AttendanceLog } from './src/models/AttendanceLog.js';
import mongoose from 'mongoose';

dotenv.config();

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all "Ag colony akash" areas
        const areas = await Area.find({ name: /^Ag colony akash$/i });
        console.log(`Found ${areas.length} "Ag colony akash" area(s)`);

        if (areas.length === 0) {
            console.log('No areas to clean up.');
            return;
        }

        const areaIds = areas.map(a => a._id);
        console.log('Area IDs:', areaIds);

        // Delete all customers in these areas
        const customerDeleteResult = await Customer.deleteMany({ area: { $in: areaIds } });
        console.log(`Deleted ${customerDeleteResult.deletedCount} customers`);

        // Delete all attendance logs for these areas
        const attendanceDeleteResult = await AttendanceLog.deleteMany({ areaId: { $in: areaIds } });
        console.log(`Deleted ${attendanceDeleteResult.deletedCount} attendance logs`);

        // Delete all duplicate areas
        const areaDeleteResult = await Area.deleteMany({ _id: { $in: areaIds } });
        console.log(`Deleted ${areaDeleteResult.deletedCount} areas`);

        console.log('\n✅ Cleanup completed successfully!');
        console.log('You can now upload your CSV file with fresh data.');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

cleanup();
