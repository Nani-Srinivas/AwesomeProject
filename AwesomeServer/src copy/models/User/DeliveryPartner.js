// models/User/DeliveryPartner.js
import mongoose, { Schema } from 'mongoose';
import { User } from './index.js';

const DeliveryPartnerSchema = new Schema({
  vehicleInfo: {
    type: {
      make: String,
      model: String,
      year: Number,
      licensePlate: String,
    },
  },
  licenseNumber: String,
  currentLocation: {
    type: {
      lat: Number,
      lng: Number,
    },
  },
});

export const DeliveryPartner = User.discriminator('DeliveryPartner', DeliveryPartnerSchema);