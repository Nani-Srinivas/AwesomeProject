// models/User/Admin.js
import { User } from './User.js';
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({});
export const Admin = User.discriminator('Admin', adminSchema);