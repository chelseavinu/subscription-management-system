const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Discount code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage'
    },
    value: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative']
    },
    min_qty: {
      type: Number,
      default: 0,
      min: 0
    },
    min_amount: {
      type: Number,
      default: 0,
      min: 0
    },
    max_discount_amount: {
      type: Number,
      comment: 'Optional cap for percentage discounts'
    },
    expiry_date: {
      type: Date
    },
    usage_limit: {
      type: Number,
      default: null,
      comment: 'Max number of times this code can be redeemed'
    },
    times_used: {
      type: Number,
      default: 0
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Discount', discountSchema);
