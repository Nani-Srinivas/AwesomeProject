import mongoose, { Schema, model } from 'mongoose';

const DeliveryZoneSchema = new Schema({
  areaId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Area', 
    required: true 
  },
  deliveryPartnerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'DeliveryPartner', 
    required: true 
  },
  baseFee: { type: Number, min: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model('DeliveryZone', DeliveryZoneSchema);