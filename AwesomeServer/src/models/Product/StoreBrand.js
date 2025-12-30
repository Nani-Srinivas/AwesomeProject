import mongoose, { Schema, model } from 'mongoose';

const StoreBrandSchema = new Schema({
    storeId: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
    },
    masterBrandId: {
        type: Schema.Types.ObjectId,
        ref: 'Brand', // Reference to the global Brand model
        required: false,
    },
    name: {
        type: String,
        required: true,
    },
    description: String,
    imageUrl: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        refPath: 'createdByModel',
        required: true,
    },
    createdByModel: {
        type: String,
        enum: ['Admin', 'StoreManager'],
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor', // Reference to the Vendor model
        default: null,
    },
}, { timestamps: true });

StoreBrandSchema.index({ storeId: 1, masterBrandId: 1 }, { unique: true });

export default model('StoreBrand', StoreBrandSchema);
