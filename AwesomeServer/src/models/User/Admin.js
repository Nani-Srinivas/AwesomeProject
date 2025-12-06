// models/User/Admin.js
import mongoose from 'mongoose';
import { baseUserSchemaDefinition, baseUserSchemaOptions } from './User.js';

const adminSchema = new mongoose.Schema({
    ...baseUserSchemaDefinition
}, baseUserSchemaOptions);

export const Admin = mongoose.model('Admin', adminSchema);