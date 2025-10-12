//config/config.js
import "dotenv/config";
import fastifySession from "@fastify/session";
import ConnectMongoDBSession from "connect-mongodb-session";
import { Admin } from "../models/User/Admin.js";
import { User } from "../models/index.js";


export const PORT = process.env.PORT || 3000;
export const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD;

const MongoDBStore = ConnectMongoDBSession(fastifySession)

export const sessionStore = new MongoDBStore({
    uri:process.env.MONGO_URI,
    collection:"sessions"
})

sessionStore.on('error',(error)=>{
    console.log("Session store error",error)
})

export const authenticate =async(email,password)=>{

     // UNCOMMENT THIS WHEN CREATING ADMIN  FIRST TIME

    // if(email && password){
    //     if(email=='nanisrinivas@gmail.com' && password==="test@123"){
    //         return Promise.resolve({ email: email, password: password }); 
    //     }else{
    //         return null
    //     }
    // }


    // UNCOMMENT THIS WHEN ALREADY CREATED ADMIN ON DATABASE

    // if(email && password){
    //     const user = await Admin.findOne({email});
    //     if(!user){
    //         return null
    //     }
    //     if(user.password===password){
    //         return Promise.resolve({ email: email, password: password }); 
    //     }else{
    //         return null
    //     }
    // }
        if(email && password){
        const user = await User.findOne({email});
        if(!user){
            return null
        }
        if(user.password===password){
            return Promise.resolve({ email: email, password: password }); 
        }else{
            return null
        }
    }

    return null
}
