//models/Product/MasterProduct.js
import mongoose, { Schema, model } from 'mongoose';

const MasterProductSchema = new Schema({
  name: { type: String, required: true, index: true },
  description: String,
  basePrice: { type: Number, min: 0 },
  brandId: { type: Schema.Types.ObjectId, ref: 'Brand' },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  subcategory: { type: Schema.Types.ObjectId, ref: 'Subcategory' },
  legacyCategoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  legacySubCategoryId: { type: Schema.Types.ObjectId, ref: 'Subcategory' },
  images: [String],
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

export default model('MasterProduct', MasterProductSchema);