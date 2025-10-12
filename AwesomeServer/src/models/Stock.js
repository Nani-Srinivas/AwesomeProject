// models/Stock.js
import mongoose, { Schema, model } from 'mongoose';

const StockSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minThreshold: {
    type: Number,
    default: 5
  },
  lastRestockedAt: Date,
  restockHistory: [{
    quantity: Number, // Positive for restocks, negative for sales
    date: Date,
    reason: String, // e.g., "Purchase", "Return", "Order Fulfillment"
  }]
}, {
  timestamps: true
});

// Ensure unique constraint: one product per store
StockSchema.index({ productId: 1, storeId: 1 }, { unique: true });

export default model('Stock', StockSchema);