// models/Finance/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  invoiceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Invoice' 
  },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Online', 'Card', 'UPI', 'Net Banking', 'Pay Later'], 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'], 
    default: 'Pending' 
  },
  transactionId: String,  // For online payments
  paymentDate: { type: Date, default: Date.now },
  notes: String,
  receipt: String,  // URL or file path to receipt
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);