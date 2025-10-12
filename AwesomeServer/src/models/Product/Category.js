// models/Product/Category.js
import mongoose, { Schema, model } from 'mongoose';

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: String,
  imageUrl: String,
  createdBy: { type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true },
  createdByModel: { type: String, enum: ['Admin', 'StoreManager'], required: true }
},
  {
    timestamps: true,
  });

// Indexes for fast querying
CategorySchema.index({ name: 1, createdBy: 1, createdByModel: 1 });

export default model('Category', CategorySchema);