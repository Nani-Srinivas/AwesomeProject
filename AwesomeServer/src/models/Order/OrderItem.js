import mongoose, { Schema, model } from 'mongoose';

const OrderItemSchema = new Schema({
  storeProductId: { 
    type: Schema.Types.ObjectId, 
    ref: 'StoreProduct', 
    required: true 
  },
  quantity: { type: Number, min: 1, required: true },
  priceAtTimeOfPurchase: { type: Number, min: 0 }
}, { timestamps: true });

export default model('OrderItem', OrderItemSchema);