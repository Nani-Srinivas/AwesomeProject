import mongoose from 'mongoose';

const AttendanceLogSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Area',
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StoreProduct',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
}, { timestamps: true });

AttendanceLogSchema.index({ date: 1, areaId: 1 }, { unique: true }); // ✅ Prevent duplicates
export const AttendanceLog = mongoose.model('AttendanceLog', AttendanceLogSchema);
