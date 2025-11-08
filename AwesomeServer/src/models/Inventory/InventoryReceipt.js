// models/Inventory/InventoryReceipt.js
import mongoose, { Schema, model } from 'mongoose';

const inventoryReceiptSchema = new Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  receivedDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  receivedBy: {
    type: Schema.Types.ObjectId,
    ref: 'StoreManager', // or User
    required: true
  },
  items: [{
    storeProductId: {
      type: Schema.Types.ObjectId,
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
    expiryDate: Date,
    notes: String
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'pending'],
    default: 'pending',
    index: true
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'digital', 'cheque'],
    required: function() {
      return this.paymentStatus !== 'pending';
    }
  },
  transactionId: String, // for digital payments
  paymentDate: Date,
  notes: String,
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'StoreManager'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
inventoryReceiptSchema.index({ storeId: 1, receivedDate: 1 });
inventoryReceiptSchema.index({ vendorId: 1, receivedDate: 1 });
inventoryReceiptSchema.index({ paymentStatus: 1 });

export default model('InventoryReceipt', inventoryReceiptSchema);