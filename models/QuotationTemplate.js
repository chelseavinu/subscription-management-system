import mongoose from 'mongoose';

const quotationTemplateItemSchema = new mongoose.Schema(
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
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    variant_name: {
      type: String,
      default: '',
      trim: true,
    },
    variant_addon: {
      type: Number,
      default: 0,
      min: [0, 'Variant addon price cannot be negative'],
    },
    tax_pct: {
      type: Number,
      default: 10,
      min: [0, 'Tax percentage cannot be negative'],
    },
  },
  { _id: true }
);

const quotationTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Quotation template name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'Enterprise',
      enum: ['Enterprise', 'SMB', 'Startup', 'DevOps', 'AI Modules'],
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'Associated plan is required'],
    },
    items: [quotationTemplateItemSchema],
    payment_terms: {
      type: String,
      default: 'Net 30',
      enum: ['Immediate', 'Net 15', 'Net 30', 'Net 60'],
    },
    validity_days: {
      type: Number,
      default: 30,
      min: [1, 'Validity period must be at least 1 day'],
    },
    discount: {
      code: { type: String, default: 'SALES10' },
      discount_type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
      value: { type: Number, default: 10 },
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

quotationTemplateSchema.index({ is_active: 1 });

const QuotationTemplate = mongoose.model('QuotationTemplate', quotationTemplateSchema);
export default QuotationTemplate;
