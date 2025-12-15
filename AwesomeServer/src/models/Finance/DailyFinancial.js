// models/Finance/DailyFinancial.js
import mongoose, { Schema, model } from 'mongoose';

const dailyFinancialSchema = new mongoose.Schema({
    date: { type: Date, required: true, index: true },
    businessDate: {
        type: String,
        required: true,
        // index: true, // REMOVED: Duplicate - indexed via compound index below
        match: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format
    },
    //   manufacturer:    { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    totalQuantity: { type: Number, required: true },   // Σ qty received
    totalPayable: { type: Number, required: true },   // Σ costPrice × qty
    totalProfit: { type: Number, required: true },   // Σ (sellingPrice – costPrice) × qty
    stockEntry: { type: Schema.Types.ObjectId, ref: 'Stock' },
    createdAt: { type: Date, default: Date.now }
});

dailyFinancialSchema.index({ businessDate: 1, category: 1 }, { unique: true });
export default model('DailyFinancial', dailyFinancialSchema);
