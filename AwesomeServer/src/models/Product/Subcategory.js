//Subcategory.js
import mongoose, { Schema, model } from 'mongoose';

const SubcategorySchema = new Schema({
  name: { type: String, required: true },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  type: {
    type: String,
    enum: ['global_subcategory', 'brand_legacy'],
    default: 'global_subcategory'
  },
  isDeprecated: {
    type: Boolean,
    default: false
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

SubcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

export default model('Subcategory', SubcategorySchema);