import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Variant name is required (e.g., Brand, Tier)'],
      trim: true,
    },
    option: {
      type: String,
      required: [true, 'Variant option is required (e.g., Odoo, Standard)'],
      trim: true,
    },
    extra_price: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Extra price cannot be negative'],
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    type: {
      type: String,
      required: [true, 'Product type is required'],
      enum: {
        values: ['service', 'software', 'physical', 'custom'],
        message: '{VALUE} is not a valid product type',
      },
      default: 'service',
      lowercase: true,
      trim: true,
    },
    sales_price: {
      type: Number,
      required: [true, 'Sales price is required'],
      min: [0, 'Sales price cannot be negative'],
    },
    cost_price: {
      type: Number,
      default: 0,
      min: [0, 'Cost price cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    variants: [variantSchema],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
