// models/Finance/DailyFinancial.js
import mongoose, { Schema, model } from 'mongoose';

const dailyFinancialSchema = new mongoose.Schema({
    date: { type: Date, required: true, index: true },
    //   manufacturer:    { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    totalQuantity: { type: Number, required: true },   // Σ qty received
    totalPayable: { type: Number, required: true },   // Σ costPrice × qty
    totalProfit: { type: Number, required: true },   // Σ (sellingPrice – costPrice) × qty
    stockEntry: { type: Schema.Types.ObjectId, ref: 'Stock' },
    createdAt: { type: Date, default: Date.now }
});

dailyFinancialSchema.index({ date: 1, category: 1 }, { unique: true });
export default model('DailyFinancial', dailyFinancialSchema);
