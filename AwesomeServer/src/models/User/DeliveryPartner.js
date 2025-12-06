// models/DeliveryPartner.js
import mongoose from 'mongoose';
import { baseUserSchemaDefinition, baseUserSchemaOptions } from './User.js';

const deliveryPartnerSchema = new mongoose.Schema({
  ...baseUserSchemaDefinition,
  aadhar: {
    type: Number,
    unique: true,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreManager',
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
  },
  area: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
  },
}, baseUserSchemaOptions);

export const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);