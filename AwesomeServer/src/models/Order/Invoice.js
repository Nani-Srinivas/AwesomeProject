import mongoose, { Schema, model } from 'mongoose';

const InvoiceSchema = new Schema({
  orderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  subtotal: { type: Number, min: 0 },
  tax: { type: Number, min: 0 },
  deliveryFee: { type: Number, min: 0 },
  total: { type: Number, min: 0 },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'wallet', 'upi'] 
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  }
}, { timestamps: true });

export default model('Invoice', InvoiceSchema);