import mongoose from 'mongoose';

const subscriptionItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    product_name: {
      type: String,
      required: [true, 'Product name snapshot is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
    unit_price: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    variant_addon: {
      type: Number,
      default: 0,
      min: [0, 'Variant addon price cannot be negative'],
    },
    tax_pct: {
      type: Number,
      default: 0,
      min: [0, 'Tax percentage cannot be negative'],
    },
  },
  { _id: true }
);

const subscriptionDiscountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    discount_type: {
      type: String,
      enum: ['percentage', 'fixed'],
    },
    value: {
      type: Number,
      default: 0,
      min: [0, 'Discount value cannot be negative'],
    },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    subscription_number: {
      type: String,
      required: [true, 'Subscription number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'Plan reference is required'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'],
        message: '{VALUE} is not a valid subscription status',
      },
      default: 'Draft',
    },
    start_date: {
      type: Date,
    },
    expiry_date: {
      type: Date,
    },
    next_billing_date: {
      type: Date,
    },
    items: [subscriptionItemSchema],
    discount: subscriptionDiscountSchema,
    total_amount: {
      type: Number,
      default: 0,
      min: [0, 'Total amount cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for quick dashboard queries and customer lookups
subscriptionSchema.index({ customer: 1, status: 1 });
subscriptionSchema.index({ next_billing_date: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
