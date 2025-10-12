//models/store/stock.js
import mongoose, { Schema, model } from 'mongoose';

const StockSchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
    virtual: true,
    get() {
      return this.timestamps ? this.createdAt : null;
    }
  },
  storeProductId: [{ 
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreProduct', required: true },
    quantity:  { type: Number, required: true, min: 0 }
  }],
createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'StoreManager',
  required: true
}}, { timestamps: true });

StockSchema.index({ storeProductId: 1 }, { unique: true });

export default model('Stock', StockSchema);