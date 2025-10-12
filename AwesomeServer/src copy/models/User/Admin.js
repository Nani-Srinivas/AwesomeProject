// models/User/Admin.js
import mongoose, { Schema } from 'mongoose';
import { User } from './index.js';

const AdminSchema = new Schema({
  accessLevel: { type: Number, default: 1 },
  permissions: [String],
});

export const Admin = User.discriminator('Admin', AdminSchema);