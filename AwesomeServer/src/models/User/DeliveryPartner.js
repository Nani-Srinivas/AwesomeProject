// models/DeliveryPartner.js
import mongoose from 'mongoose';
import { User } from '../User/User.js'; // Import the base User model

const deliveryPartnerSchema = new mongoose.Schema({
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
});

export const DeliveryPartner = User.discriminator('DeliveryPartner', deliveryPartnerSchema);