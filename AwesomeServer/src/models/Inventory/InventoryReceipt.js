// models/Inventory/InventoryReceipt.js
import mongoose from 'mongoose';

const InventoryReceiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  receivedDate: {
    type: Date,
    default: Date.now
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // or StoreManager depending on your user model
    required: true
  },
  items: [{
    storeProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoreProduct',
      required: true
    },
    receivedQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    batchNumber: String,
    expiryDate: Date
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'pending'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'digital', 'cheque']
  },
  transactionId: String,
  notes: String,
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Reference to the approving user
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
InventoryReceiptSchema.index({ vendorId: 1, receivedDate: 1 });
InventoryReceiptSchema.index({ receivedDate: 1 });

export default mongoose.model('InventoryReceipt', InventoryReceiptSchema);