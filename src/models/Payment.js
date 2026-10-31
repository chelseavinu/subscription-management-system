const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    payment_number: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      index: true
    },
    invoice_number: {
      type: String,
      required: true
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    customer_name: {
      type: String
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than zero']
    },
    payment_method: {
      type: String,
      enum: ['bank_transfer', 'credit_card', 'stripe', 'cash', 'cheque', 'other'],
      default: 'bank_transfer'
    },
    transaction_reference: {
      type: String,
      trim: true
    },
    payment_date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['completed', 'failed', 'refunded'],
      default: 'completed'
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
