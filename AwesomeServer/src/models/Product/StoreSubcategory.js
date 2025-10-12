import mongoose, { Schema, model } from 'mongoose';

const StoreSubcategorySchema = new Schema({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  storeCategoryId: {
    type: Schema.Types.ObjectId,
    ref: 'StoreCategory',
    required: true,
  },
  masterSubcategoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Subcategory',
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    refPath: 'createdByModel',
    required: true,
  },
  createdByModel: {
    type: String,
    enum: ['Admin', 'StoreManager'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

StoreSubcategorySchema.index({ storeId: 1, storeCategoryId: 1, name: 1 }, { unique: true });
StoreSubcategorySchema.index({ storeId: 1, storeCategoryId: 1, masterSubcategoryId: 1 }, { unique: true, sparse: true });

export default model('StoreSubcategory', StoreSubcategorySchema);
