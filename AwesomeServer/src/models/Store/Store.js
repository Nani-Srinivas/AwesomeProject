// import mongoose, { Schema, model } from 'mongoose';

// const StoreSchema = new Schema({
//   name: {
//     type: String,
//     required: true,
//     unique: true,
//     index: true
//   },
//   ownerId: {
//     type: Schema.Types.ObjectId,
//     ref: 'StoreManager',
//     required: true
//   },
//   address: {
//     street: String,
//     city: String,
//     state: String,
//     zip: String,
//     country: String
//   },
//   location: {
//     type: { type: String, required: true },
//     coordinates: []
//   },
//   // timings: {
//   //   monday: { open: String, close: String },
//   //   // ... other days
//   // },
//   status: {
//     type: String,
//     enum: ['active', 'maintenance', 'closed'],
//     default: 'active'
//   }
// }, { timestamps: true });
// StoreSchema.index({ location: "2dsphere" });
// export default model('Store', StoreSchema);


// models/Store.js
import mongoose, { Schema, model } from 'mongoose';

const StoreSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'StoreManager',
    required: true,
    unique: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(v) {
          const [lng, lat] = v;
          return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
        },
        message: props => `${props.value} must be valid [longitude, latitude]`
      }
    }
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'closed'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true
});

// 2dsphere index for geospatial queries
StoreSchema.index({ location: '2dsphere' }, { ownerId: 1 }, { unique: true });
export default model('Store', StoreSchema);