// import mongoose from 'mongoose';

// const invoiceSchema = new mongoose.Schema({
//   customerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Customer',
//     required: true,
//   },
//   period: {
//     type: String,
//     required: true,
//   },
//   invoiceUrl: {
//     type: String,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Check if the model already exists before compiling it
// const Invoice = mongoose.connection.models.Invoice || mongoose.model('Invoice', invoiceSchema);

// export default Invoice;


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
//export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
