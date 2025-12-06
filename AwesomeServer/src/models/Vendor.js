// models/Vendor.js
import mongoose, { Schema, model } from 'mongoose';

const VendorSchema = new Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true  // Index for faster queries
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  paymentTerms: {
    type: String,  // e.g. "Net 30", "Cash on Delivery"
    default: "Cash on Delivery"
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  notes: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted'],
    default: 'active'
  },
  payableAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'pending'],
    default: 'pending'
  },
  assignedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreCategory'  // Reference to StoreCategory model
  }]
}, {
  timestamps: true
});



export default model('Vendor', VendorSchema);