import mongoose from 'mongoose';

const StoreSubcategorySchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  storeCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreCategory',
    required: true,
  },
  masterSubcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
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

// Check if the model already exists before defining it
const StoreSubcategory = mongoose.models.StoreSubcategory || mongoose.model('StoreSubcategory', StoreSubcategorySchema);
export default StoreSubcategory;