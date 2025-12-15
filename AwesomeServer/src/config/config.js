//config/config.js
import "dotenv/config";
import fastifySession from "@fastify/session";
import ConnectMongoDBSession from "connect-mongodb-session";
import { Admin } from "../models/User/Admin.js";



export const PORT = process.env.PORT || 3000;
export const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD;

const MongoDBStore = ConnectMongoDBSession(fastifySession)

export const sessionStore = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "sessions"
})

sessionStore.on('error', (error) => {
    console.log("⚠️  Session store error (non-critical):", error.message)
    // Don't crash the server - AdminJS sessions are optional for API functionality
})

export const authenticate = async (email, password) => {
    console.log("Authenticate function called with:", email, password);

    // UNCOMMENT THIS WHEN CREATING ADMIN FIRST TIME
    // if (email && password) {
    //     if (email == 'nanisrinivas@gmail.com' && password === "test@123") {
    //         console.log("Hardcoded admin credentials matched.");
    //         return Promise.resolve({ email: email, password: password, role: 'Admin', _id: '5f8d0d55b54764421b7156d9', roles: ['Admin'] });
    //     } else {
    //         console.log("Hardcoded credentials did not match.");
    //     }
    // }

    // UNCOMMENT THIS WHEN ALREADY CREATED ADMIN ON DATABASE

    if (email && password) {
        console.log("Checking database for admin...");
        const user = await Admin.findOne({ email }).select('+password'); // Explicitly select password
        if (!user) {
            console.log("Admin not found in database.");
            return null;
        }

        if (user.password === password) { // Note: You should use bcrypt.compare here in production!
            console.log("Admin password matched.");
            const { password: _, ...userWithoutPassword } = user.toObject();
            return userWithoutPassword; // Returns user without password
        } else {
            console.log("Admin password did not match.");
        }
    }

    console.log("Authentication failed.");
    return null;
}





//         if(email && password){
//         const user = await User.findOne({email});
//         if(!user){
//             return null
//         }
//         if(user.password===password){
//             return Promise.resolve({ email: email, password: password }); 
//         }else{
//             return null
//         }
//     }

//     return null
//}
