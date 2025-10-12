// models/User/index.js
import mongoose, { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  password: String,
  phone: String,
  role: {
    type: String,
    required: true,
    enum: ['Customer', 'StoreManager', 'DeliveryPartner', 'Admin']
  }
}, {
  discriminatorKey: 'role',
  timestamps: true
});

export const User = model('User', UserSchema);