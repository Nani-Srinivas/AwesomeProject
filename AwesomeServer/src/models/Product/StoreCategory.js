import mongoose, { Schema, model } from 'mongoose';

const StoreCategorySchema = new Schema({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  masterCategoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  imageUrl: String,
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

StoreCategorySchema.index({ storeId: 1, name: 1 }, { unique: true });
StoreCategorySchema.index({ storeId: 1, masterCategoryId: 1 }, { unique: true, sparse: true });

export default model('StoreCategory', StoreCategorySchema);
