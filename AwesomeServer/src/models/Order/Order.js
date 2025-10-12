import mongoose, { Schema, model } from 'mongoose';

const OrderSchema = new Schema({
  orderId: { 
    type: String, 
    unique: true, 
    index: true 
  },
  customerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  storeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Store', 
    required: true 
  },
  items: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'OrderItem' 
  }],
  totalAmount: { type: Number, min: 0 },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  deliveryZoneId: { 
    type: Schema.Types.ObjectId, 
    ref: 'DeliveryZone' 
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  }
}, { timestamps: true });

// Add pre-save hook for orderId generation
OrderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const counter = await Counter.findOneAndUpdate(
      { modelName: 'Order' },
      { $inc: { sequenceValue: 1 } },
      { new: true, upsert: true }
    );
    this.orderId = `ORD-${counter.sequenceValue.toString().padStart(6, '0')}`;
  }
  next();
});

export default model('Order', OrderSchema);