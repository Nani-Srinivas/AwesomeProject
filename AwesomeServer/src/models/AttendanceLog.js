// import mongoose from 'mongoose';

// const AttendanceLogSchema = new mongoose.Schema({
//   customerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Customer',
//     required: true,
//   },
//   date: {
//     type: Date,
//     required: true,
//   },
//   areaId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Area',
//     required: true,
//   },
//   products: [
//     {
//       productId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'StoreProduct',
//         required: true,
//       },
//       quantity: {
//         type: Number,
//         required: true,
//         min: 0,
//       },
//       status: {
//         type: String,
//         enum: ['delivered', 'not_delivered', 'skipped', 'out_of_stock'],
//         required: true,
//         default: 'delivered',
//       },
//     },
//   ],
// }, { timestamps: true });

// AttendanceLogSchema.index({ date: 1, areaId: 1, customerId: 1 }, { unique: true }); // ✅ Prevent duplicates
// export const AttendanceLog = mongoose.model('AttendanceLog', AttendanceLogSchema);

// ============================================
// ATTENDANCE MODEL (OPTIMIZED)
// ============================================
import mongoose from 'mongoose';

const AttendanceLogSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
    },
    businessDate: {
      type: String,
      required: true,
      // index: true, // REMOVED: Duplicate - indexed via compound index below
      match: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format
    },
    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
      required: true,
    },
    // ✅ Single nested array for all customers visited on this day in this area
    attendance: [
      {
        customerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Customer',
          required: true,
        },
        products: [
          {
            productId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'StoreProduct',
              required: true,
            },
            quantity: {
              type: Number,
              required: true,
              min: 0,
            },
            status: {
              type: String,
              enum: ['delivered', 'not_delivered', 'skipped', 'out_of_stock'],
              required: true,
              default: 'delivered',
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// ✅ Unique index: one record per business day per area per store
// AttendanceLogSchema.index(
//   { businessDate: 1, areaId: 1, storeId: 1 },
//   { unique: true, sparse: true }
// );

export const AttendanceLog = mongoose.model('AttendanceLog', AttendanceLogSchema);
