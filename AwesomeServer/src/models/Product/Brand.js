// models/Product/Brand.js
import mongoose, { Schema, model } from 'mongoose';

const BrandSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    description: String,
    imageUrl: String,
    createdBy: { type: Schema.Types.ObjectId, refPath: 'createdByModel', required: true },
    createdByModel: { type: String, enum: ['Admin', 'StoreManager'], required: true }
},
    {
        timestamps: true,
    });

// Indexes for fast querying
// BrandSchema.index({ name: 1 }); // Removed to avoid duplicate index warning (already indexed in field definition)

export default model('Brand', BrandSchema);
