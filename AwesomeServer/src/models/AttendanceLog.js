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
    date: {
      type: Date,
      required: true,
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

// ✅ Unique index: one record per day per area
AttendanceLogSchema.index(
  { date: 1, areaId: 1 },
  { unique: true, sparse: true }
);

export const AttendanceLog = mongoose.model('AttendanceLog', AttendanceLogSchema);
