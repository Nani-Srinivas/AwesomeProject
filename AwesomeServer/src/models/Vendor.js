// models/Vendor.js
import mongoose, { Schema, model } from 'mongoose';

const VendorSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
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
  assignedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'StoreCategory'  // Reference to StoreCategory model
  }]
}, {
  timestamps: true
});

VendorSchema.index({ phone: 1 }, { unique: true });

export default model('Vendor', VendorSchema);