import mongoose, { Schema, model } from 'mongoose';

const DeliveryBoySchema = new Schema({
  areaId: {
    type: Schema.Types.ObjectId,
    ref: 'Area',
    required: true,
    index: true
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreManager',
  },
  currentStockItems: Number,
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

DeliveryBoySchema.index({ phone: 1, storeId: 1 }, { unique: true });
export default model('DeliveryBoy', DeliveryBoySchema);