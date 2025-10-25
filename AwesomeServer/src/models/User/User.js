// models/User/User.js
import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  password: { type: String },
  name: { type: String, trim: true },
  roles: {
    type: [String],
    enum: ['Customer', 'DeliveryPartner', 'StoreManager', 'Admin'],
    default: [],
  },
  isActivated: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Base model
export const User = mongoose.model('User', userSchema);