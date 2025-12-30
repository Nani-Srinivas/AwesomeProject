// scripts/check_connection.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly looking for .env in the parent directory
const envPath = path.join(__dirname, '../.env');
console.log(`Loading .env from: ${envPath}`);

const result = dotenv.config({ path: envPath });
if (result.error) {
    console.warn("⚠️  Could not find or read .env file");
} else {
    console.log("✅ .env file loaded successfully");
}

const uri = process.env.MONGO_URI;

// Mask the password for logging
const maskedUri = uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'UNDEFINED';

console.log(`\n---------------------------------------------------`);
console.log(`Current MONGO_URI: ${maskedUri}`);
console.log(`---------------------------------------------------\n`);

if (!uri) {
    console.error("❌ ERROR: MONGO_URI is not set in environment variables.");
    console.error("   Please check your .env file and ensure the key is named 'MONGODB_URI'.");
    process.exit(1);
}

const connectDB = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Connection SUCCESSFUL!");
        await mongoose.disconnect();
    } catch (error) {
        console.error("❌ Connection FAILED:");
        console.error(error.message);
    }
};

connectDB();
