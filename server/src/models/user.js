import mongoose from "mongoose";

// Base User Schema

const userSchema = new mongoose.Schema({
    name: { type : String },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: {
        type: String,
        enum: ["StoreManager", "Customer", "Admin", "DeliveryPartner"],
        required: true,
    },
    isActivated: {type: Boolean, default: false}
})

const toJSONTransform = { 
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
}

// Storemanager Schema

const storeManagerSchema = new mongoose.Schema({
    ...userSchema.obj,
    phone : { type: String, required: true, unique: true },
    role: { type: String, enum: ["StoreManager"], default: "StoreManager" },
    liveLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    address: { type: String },
})
storeManagerSchema.set('toJSON', toJSONTransform);


// Customer Schema

const customerSchema = new mongoose.Schema({
    ...userSchema.obj,
    phone : { type: String, required: true, unique: true },
    role: { type: String, enum: ["Customer"], default: "Customer" },
    liveLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    address: { type: String },
})

customerSchema.set('toJSON', toJSONTransform);

import bcrypt from 'bcrypt';

// Delivery Partner Schema
const deliveryPartnerSchema = new mongoose.Schema({
    ...userSchema.obj,
    phone: { type: String, required: true },
    role: { type: String, enum: ["DeliveryPartner"], default: "DeliveryPartner" },
    liveLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    address: { type: String },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
  });

  deliveryPartnerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });
  
  deliveryPartnerSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  deliveryPartnerSchema.set('toJSON', toJSONTransform);
  
  

// Admin Schema

const adminSchema = new mongoose.Schema({
    ...userSchema.obj,
    role: { type: String, enum: ["Admin"], default: "Admin" },
});

adminSchema.set('toJSON', toJSONTransform);


export const StoreManager = mongoose.model("StoreManager", storeManagerSchema);
export const Customer = mongoose.model("Customer", customerSchema);
export const DeliveryPartner = mongoose.model(
  "DeliveryPartner",
  deliveryPartnerSchema
);
export const Admin = mongoose.model("Admin", adminSchema);
