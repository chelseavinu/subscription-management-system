const mongoose = require('mongoose');

const subscriptionItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  product_name: {
    type: String,
    required: true
  },
  variant: {
    name: { type: String },      // e.g. "Brand"
    option: { type: String },    // e.g. "Odoo"
    extra_price: { type: Number, default: 0 } // e.g. 560
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  unit_price: {
    type: Number,
    required: true,
    min: 0
  },
  tax_pct: {
    type: Number,
    default: 10,
    min: 0
  },
  tax_amount: {
    type: Number,
    default: 0
  },
  discount_amount: {
    type: Number,
    default: 0
  },
  line_total: {
    type: Number,
    required: true
  }
});

const statusHistorySchema = new mongoose.Schema({
  from_status: { type: String },
  to_status: { type: String, required: true },
  changed_at: { type: Date, default: Date.now },
  changed_by: { type: String, default: 'System' },
  reason: { type: String }
});

const subscriptionSchema = new mongoose.Schema(
  {
    subscription_number: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    customer_name: {
      type: String,
      required: true
    },
    customer_email: {
      type: String,
      required: true
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true
    },
    plan_name: {
      type: String,
      required: true
    },
    billing_interval: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true,
      default: 'monthly'
    },
    status: {
      type: String,
      enum: ['draft', 'quotation', 'confirmed', 'active', 'paused', 'closed'],
      default: 'draft',
      index: true
    },
    payment_terms: {
      type: String,
      enum: ['immediate', 'net_15', 'net_30', 'net_60'],
      default: 'net_15'
    },
    start_date: {
      type: Date,
      default: Date.now
    },
    expiry_date: {
      type: Date
    },
    next_billing_date: {
      type: Date,
      index: true
    },
    last_billed_date: {
      type: Date
    },
    auto_close: {
      type: Boolean,
      default: false
    },
    allow_pause: {
      type: Boolean,
      default: true
    },
    quotation_valid_until: {
      type: Date
    },
    items: [subscriptionItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    tax_total: {
      type: Number,
      required: true,
      default: 0
    },
    discount_total: {
      type: Number,
      default: 0
    },
    applied_discount_code: {
      type: String
    },
    recurring_total: {
      type: Number,
      required: true,
      default: 0
    },
    notes: {
      type: String
    },
    history: [statusHistorySchema]
  },
  { timestamps: true }
);

// Compound index for billing run query efficiency
subscriptionSchema.index({ status: 1, next_billing_date: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
