// models/User/StoreManager.js
import mongoose from 'mongoose';
import { baseUserSchemaDefinition, baseUserSchemaOptions } from './User.js';

const storeManagerSchema = new mongoose.Schema({
  ...baseUserSchemaDefinition,
  additionalDetailsCompleted: { type: Boolean, default: false },
  hasSelectedCategories: { type: Boolean, default: false },
  hasSelectedSubcategories: { type: Boolean, default: false },
  hasSelectedProducts: { type: Boolean, default: false },
  hasAddedProductPricing: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  selectedCategoryIds: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    default: undefined  // Don't auto-initialize to []
  },
  selectedSubcategoryIds: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }],
    default: undefined  // Don't auto-initialize to []
  },
  selectedProductIds: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MasterProduct' }],
    default: undefined  // Don't auto-initialize to []
  },
  upiId: {
    type: String,
    trim: true,
    default: null  // UPI ID for receiving payments from customers
  },
}, baseUserSchemaOptions);

storeManagerSchema.index({ location: '2dsphere' });

export const StoreManager = mongoose.model('StoreManager', storeManagerSchema);