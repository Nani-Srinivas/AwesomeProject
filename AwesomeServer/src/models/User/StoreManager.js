// models/User/StoreManager.js
import { User } from './User.js';
import mongoose from 'mongoose';

const storeManagerSchema = new mongoose.Schema({
  additionalDetailsCompleted: { type: Boolean, default: false },
  hasSelectedCategories: { type: Boolean, default: false },
  hasSelectedProducts: { type: Boolean, default: false },
  selectedCategoryIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
});
storeManagerSchema.index({ location: '2dsphere' });

export const StoreManager = User.discriminator('StoreManager', storeManagerSchema);