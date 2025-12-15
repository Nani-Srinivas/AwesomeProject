//models/store/stock.js
import mongoose, { Schema, model } from 'mongoose';

const StockSchema = new Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
    index: true
  },
  date: {
    type: Date,
    default: Date.now,
    virtual: true,
    get() {
      return this.timestamps ? this.createdAt : null;
    }
  },
  businessDate: {
    type: String,
    required: true,
    // Indexed via schema.index() below
    match: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format
  },
  storeProductId: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreProduct', required: true },
    quantity: { type: Number, required: true, min: 0 }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreManager',
    required: true
  }
}, { timestamps: true });


StockSchema.index({ businessDate: 1 }); // For querying by business date
StockSchema.index({ storeProductId: 1 }, { unique: true });


export default model('Stock', StockSchema);