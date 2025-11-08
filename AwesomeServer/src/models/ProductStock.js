// models/Stock.js
import mongoose, { Schema, model } from 'mongoose';

const StockSchema = new Schema({
  storeProductId: {
    type: Schema.Types.ObjectId,
    ref: 'StoreProduct',
    required: true,
    index: true
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  currentQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minThreshold: {
    type: Number,
    default: 5
  },
  maxThreshold: {
    type: Number,
    default: 100
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  availableQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  lastRestockedAt: Date,
  lastSoldAt: Date,
  expiryDates: [{
    batchNumber: String,
    expiryDate: Date,
    quantity: Number
  }],
  restockHistory: [{
    quantity: Number, // Positive for restocks, negative for sales/deductions
    date: Date,
    reason: String, // e.g., "Purchase", "Return", "Order Fulfillment", "Spoilage"
    referenceId: Schema.Types.ObjectId, // Link to InventoryReceipt or other document
    referenceType: String // "InventoryReceipt", "Return", "Adjustment", etc.
  }],
  costPrice: {
    type: Number, // Cost price per unit
    default: 0,
    min: 0
  },
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'StoreManager'
  }
}, {
  timestamps: true
});

// Ensure unique constraint: one product per store
StockSchema.index({ storeProductId: 1, storeId: 1 }, { unique: true });

export default model('ProductStock', StockSchema);  // Renamed to avoid conflict