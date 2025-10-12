// models/User/Customer.js
import mongoose, { Schema } from 'mongoose';
import { User } from './index.js';

const AddressSchema = new Schema(
  {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    isDefault: Boolean,
  },
  { _id: false }
);

const CustomerSchema = new Schema({
  addresses: [AddressSchema],
  cart: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
    },
  ],
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
});

export const Customer = User.discriminator('Customer', CustomerSchema);