// models/User/StoreManager.js
import mongoose, { Schema } from 'mongoose';
import { User } from './index.js';

const StoreManagerSchema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store' },
  permissions: [String],
});

export const StoreManager = User.discriminator('StoreManager', StoreManagerSchema);