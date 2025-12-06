// models/Customer.js
import mongoose from 'mongoose';
import { baseUserSchemaDefinition, baseUserSchemaOptions } from './User.js';

const customerSchema = new mongoose.Schema({
  ...baseUserSchemaDefinition,
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
  lastPaymentDate: Date,
  paymentCycle: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    default: 'Monthly'
  },
  lastBillPeriod: String,
  creditBalance: { type: Number, default: 0 },

  address: {
    Apartment: { type: String },
    FlatNo: { type: String },
    zip: { type: String },
    city: { type: String, default: 'Hyderabad' },
    state: { type: String, default: 'Telangana' },
    country: { type: String, default: 'India' }
  },
}, baseUserSchemaOptions);

export const Customer = mongoose.model('Customer', customerSchema);