// import mongoose, { Schema, model } from 'mongoose';

// const InvoiceSchema = new Schema({
//   orderId: { 
//     type: Schema.Types.ObjectId, 
//     ref: 'Order', 
//     required: true 
//   },
//   subtotal: { type: Number, min: 0 },
//   tax: { type: Number, min: 0 },
//   deliveryFee: { type: Number, min: 0 },
//   total: { type: Number, min: 0 },
//   paymentMethod: { 
//     type: String, 
//     enum: ['cash', 'card', 'wallet', 'upi'] 
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'paid', 'failed', 'refunded'],
//     default: 'pending'
//   }
// }, { timestamps: true });

// export default model('Invoice', InvoiceSchema);

// models/Invoice.js
import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  billNo: { type: String, required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  fromDate: String,
  toDate: String,
  items: Array,
  deliveryCharges: String,
  grandTotal: String,
  cloudinary: {
    public_id: String,
    url: String,
    secure_url: String,
    bytes: Number,
    resource_type: String,
  },
  createdAt: { type: Date, default: () => new Date() },
  generatedBy: { type: String }, // optional (user id / system)
}, { timestamps: true });

const Invoice = mongoose.connection.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
export default Invoice;