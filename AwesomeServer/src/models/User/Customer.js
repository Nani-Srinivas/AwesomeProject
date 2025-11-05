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
  advanceAmount: { type: Number, default: 0 },
  typeOfRegistered: {
    type: String,
    enum: ['self', 'StoreManager'],
    default: 'StoreManager',
  },
  
  // Payment related fields
  paymentStatus: {
    type: String,
    enum: ["Paid", "Unpaid", "Partially Paid"],
    default: "Unpaid",
  },
  currentDueAmount: { type: Number, default: 0 }, // Outstanding amount
  lastPaymentDate: Date, // Date of last payment
  paymentCycle: { 
    type: String, 
    enum: ['Daily', 'Weekly', 'Monthly'], 
    default: 'Monthly' 
  },
  lastBillPeriod: String, // Format: "Month Year" or "YYYY-MM-DD to YYYY-MM-DD"
  totalAmountPayable: { type: Number, default: 0 },
  totalAmountPaid: { type: Number, default: 0 },
  
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