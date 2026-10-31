import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Discount code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [2, 'Discount code must be at least 2 characters'],
      maxlength: [30, 'Discount code cannot exceed 30 characters'],
    },
    type: {
      type: String,
      required: [true, 'Discount type is required'],
      enum: {
        values: ['percentage', 'fixed'],
        message: '{VALUE} is not a valid discount type',
      },
      lowercase: true,
      trim: true,
    },
    value: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    min_qty: {
      type: Number,
      default: 0,
      min: [0, 'Minimum quantity cannot be negative'],
    },
    min_amount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum amount cannot be negative'],
    },
    start_date: {
      type: Date,
    },
    expiry_date: {
      type: Date,
    },
    usage_limit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1 if set'],
    },
    times_used: {
      type: Number,
      default: 0,
      min: [0, 'Times used cannot be negative'],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

discountSchema.index({ code: 1, is_active: 1 });

const Discount = mongoose.model('Discount', discountSchema);
export default Discount;
