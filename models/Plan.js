import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      maxlength: [100, 'Plan name cannot exceed 100 characters'],
    },
    billing_interval: {
      type: String,
      required: [true, 'Billing interval is required'],
      enum: {
        values: ['daily', 'weekly', 'monthly', 'yearly'],
        message: '{VALUE} is not a supported billing interval',
      },
      lowercase: true,
      trim: true,
    },
    base_price: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    min_quantity: {
      type: Number,
      default: 1,
      min: [1, 'Minimum quantity must be at least 1'],
    },
    auto_close: {
      type: Boolean,
      default: false,
    },
    allow_pause: {
      type: Boolean,
      default: false,
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

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
