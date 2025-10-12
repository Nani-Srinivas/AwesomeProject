// models/Customer.js
import mongoose from 'mongoose';
import { User } from '../User/User.js'; // Import the base User model

const customerSchema = new mongoose.Schema({
  requiredProduct: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreProduct' },
    quantity: { type: Number, required: true },
  }],
  deliveryCost: { type: Number },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreManager',
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
  },
  isSubscribed: { type: Boolean, default: false },
  advanceAmount: { type: Number },
  typeOfRegistered: {
    type: String,
    enum: ['self', 'StoreManager'],
    default: 'StoreManager',
  },
  Bill: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid",
  },
  address: {
    Apartment: { type: String },
    FlatNo: { type: String },
    zip: { type: String },
    city: { type: String, default: 'Hyderabad' },
    state: { type: String, default: 'Telangana' },
    country: { type: String, default: 'India' }
  },
  refreshToken: String,
});

customerSchema.index({ location: '2dsphere' });

export const Customer = User.discriminator('Customer', customerSchema);