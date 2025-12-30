//models/Product/StoreProduct.js
import mongoose, { Schema, model } from 'mongoose';

const StoreProductSchema = new Schema({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  masterProductId: {
    type: Schema.Types.ObjectId,
    ref: 'MasterProduct',
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  description: String,
  costPrice: {
    type: Number,
    min: 0,
    required: true,
  },
  sellingPrice: {
    type: Number,
    min: 0,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active',
  },
  stock: {
    type: Number,
    min: 0,
    default: 0,
  },
  storeCategoryId: {
    type: Schema.Types.ObjectId,
    ref: 'StoreCategory',
    required: true,
  },
  storeSubcategoryId: {
    type: Schema.Types.ObjectId,
    ref: 'StoreSubcategory',
    default: null,
  },
  storeBrandId: {
    type: Schema.Types.ObjectId,
    ref: 'StoreBrand',
    default: null,
  },
  images: [String],
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    refPath: 'createdByModel',
    required: true,
  },
  createdByModel: {
    type: String,
    required: true,
    enum: ['Admin', 'StoreManager'],
  },
}, { timestamps: true });

StoreProductSchema.index({ storeId: 1, name: 1 }, { unique: true });
StoreProductSchema.index({ storeId: 1, masterProductId: 1 }, { unique: true, sparse: true });

export default model('StoreProduct', StoreProductSchema);
