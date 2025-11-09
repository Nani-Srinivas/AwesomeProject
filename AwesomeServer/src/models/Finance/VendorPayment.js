// models/Finance/VendorPayment.js
import mongoose, { Schema, model } from 'mongoose';

const VendorPaymentSchema = new Schema({
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  receiptIds: [{
    type: Schema.Types.ObjectId,
    ref: 'InventoryReceipt'
  }], // Array of receipt IDs this payment applies to
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    required: true,
    enum: ['cash', 'bank_transfer', 'digital', 'cheque']
  },
  transactionId: String, // For non-cash payments
  notes: String,
  paymentDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // or StoreManager depending on your user model
    required: true
  },
  appliedToReceipts: [{
    receiptId: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryReceipt'
    },
    amountApplied: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
VendorPaymentSchema.index({ vendorId: 1, paymentDate: -1 });
VendorPaymentSchema.index({ paymentDate: -1 });

export default model('VendorPayment', VendorPaymentSchema);