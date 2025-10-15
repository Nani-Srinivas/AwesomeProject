import mongoose, { Schema, model } from 'mongoose';

const AreaSchema = new Schema({
  name: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreManager',
  },
  totalSubscribedItems: Number,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

AreaSchema.index({ name: 1, createdBy: 1 }, { unique: true });
export default model('Area', AreaSchema);