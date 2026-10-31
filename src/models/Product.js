const mongoose = require('mongoose');

const variantOptionSchema = new mongoose.Schema({
  name: {
    type: String, // e.g. "Brand", "Tier", "Storage"
    required: true
  },
  option: {
    type: String, // e.g. "Odoo", "Pro", "100GB"
    required: true
  },
  extra_price: {
    type: Number, // e.g. 560
    default: 0
  }
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['software', 'addon', 'service', 'hardware'],
      default: 'software'
    },
    sales_price: {
      type: Number,
      required: [true, 'Sales price is required'],
      min: [0, 'Sales price cannot be negative']
    },
    cost_price: {
      type: Number,
      default: 0,
      min: [0, 'Cost price cannot be negative']
    },
    tax_pct: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    notes: {
      type: String,
      trim: true
    },
    variants: [variantOptionSchema],
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
