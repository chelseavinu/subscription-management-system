import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    product_name: {
      type: String,
      required: true,
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
      required: true,
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
    total: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoice_number: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: [true, 'Subscription reference is required'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
    },
    due_date: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Subtotal cannot be negative'],
    },
    tax_amount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative'],
    },
    total_amount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Draft', 'Confirmed', 'Paid', 'Overdue'],
        message: '{VALUE} is not a valid invoice status',
      },
      default: 'Draft',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes for reporting, billing queries, and status filtering
invoiceSchema.index({ customer: 1, status: 1 });
invoiceSchema.index({ subscription: 1 });
invoiceSchema.index({ due_date: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
