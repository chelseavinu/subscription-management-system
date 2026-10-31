const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true
    },
    code: {
      type: String,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    billing_interval: {
      type: String,
      required: [true, 'Billing interval is required'],
      enum: {
        values: ['daily', 'weekly', 'monthly', 'yearly'],
        message: '{VALUE} is not a valid billing interval'
      }
    },
    base_price: {
      type: Number,
      default: 0,
      min: [0, 'Base price cannot be negative']
    },
    min_quantity: {
      type: Number,
      default: 1,
      min: [1, 'Minimum quantity must be at least 1']
    },
    auto_close: {
      type: Boolean,
      default: false,
      comment: 'If true, subscription closes automatically upon reaching expiry date'
    },
    allow_pause: {
      type: Boolean,
      default: true,
      comment: 'If true, subscription can be paused and resumed'
    },
    allow_early_close: {
      type: Boolean,
      default: true,
      comment: 'If true, subscription can be closed before expiry'
    },
    allow_renew: {
      type: Boolean,
      default: true,
      comment: 'If true, subscription can be renewed upon expiry'
    },
    available_from: {
      type: Date,
      default: Date.now
    },
    available_to: {
      type: Date
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
