const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  product_name: {
    type: String,
    required: true
  },
  variant_info: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit_price: {
    type: Number,
    required: true
  },
  tax_pct: {
    type: Number,
    default: 10
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

const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    subscription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      index: true
    },
    subscription_number: {
      type: String,
      required: true
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    customer_name: {
      type: String,
      required: true
    },
    customer_email: {
      type: String,
      required: true
    },
    customer_address: {
      type: String
    },
    billing_period_start: {
      type: Date,
      required: true
    },
    billing_period_end: {
      type: Date,
      required: true
    },
    issue_date: {
      type: Date,
      default: Date.now
    },
    due_date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'confirmed', 'paid', 'cancelled'],
      default: 'draft',
      index: true
    },
    payment_status: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid'],
      default: 'unpaid',
      index: true
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    tax_amount: {
      type: Number,
      required: true,
      default: 0
    },
    discount_amount: {
      type: Number,
      default: 0
    },
    total_amount: {
      type: Number,
      required: true,
      default: 0
    },
    amount_paid: {
      type: Number,
      default: 0,
      min: 0
    },
    amount_due: {
      type: Number,
      required: true,
      default: 0
    },
    sent_at: {
      type: Date
    },
    notes: {
      type: String
    },
    history: [
      {
        from_status: String,
        to_status: String,
        changed_at: { type: Date, default: Date.now },
        action: String,
        notes: String
      }
    ]
  },
  { timestamps: true }
);

// Compound index to guarantee idempotency and avoid duplicate invoices per billing period
invoiceSchema.index({ subscription_id: 1, billing_period_end: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
