import mongoose from 'mongoose';
import 'dotenv/config';
import { Customer, StoreManager, DeliveryPartner, Admin } from '../src/models/User/index.js';

// Define a temporary schema for the old 'users' collection to read data
const oldUserSchema = new mongoose.Schema({}, { strict: false });
const OldUser = mongoose.model('OldUser', oldUserSchema, 'users');

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await OldUser.find({});
        console.log(`Found ${users.length} users to migrate`);

        for (const user of users) {
            const userData = user.toObject();
            const roles = userData.roles || [];
            const role = roles[0]; // Assuming primary role is first

            console.log(`Migrating user ${userData.email || userData.phone} with role ${role}...`);

            let Model;
            switch (role) {
                case 'Customer': Model = Customer; break;
                case 'StoreManager': Model = StoreManager; break;
                case 'DeliveryPartner': Model = DeliveryPartner; break;
                case 'Admin': Model = Admin; break;
                default:
                    console.warn(`Unknown role ${role} for user ${userData._id}. Skipping.`);
                    continue;
            }

            // Check if already exists in new collection
            const existing = await Model.findById(userData._id);
            if (existing) {
                console.log(`User ${userData._id} already exists in ${Model.modelName}. Skipping.`);
                continue;
            }

            try {
                // Create new document with same ID
                // We use insertMany or create, but we need to ensure _id is preserved if possible
                // Mongoose 'create' might generate a new _id if we don't pass it explicitly, 
                // but passing it in the object usually works.

                // Clean up fields that might not belong (though strict: false in new models might handle it, 
                // our new models are strict).
                // For simplicity, we pass the whole object. Mongoose will strip unknown fields 
                // if strict is true (default).

                // IMPORTANT: We need to ensure the _id is preserved to keep relationships working.

                const newDoc = new Model(userData);
                newDoc.isNew = true; // Force save as new
                await newDoc.save();

                console.log(`Successfully migrated ${userData.email || userData.phone} to ${Model.modelName}`);
            } catch (err) {
                console.error(`Failed to migrate user ${userData._id}:`, err.message);
            }
        }

        console.log('Migration completed.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
