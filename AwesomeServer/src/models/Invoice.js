import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  period: {
    type: String,
    required: true,
  },
  invoiceUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model already exists before compiling it
const Invoice = mongoose.connection.models.Invoice || mongoose.model('Invoice', invoiceSchema);

export default Invoice;
