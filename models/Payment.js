import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    payment_number: {
      type: String,
      sparse: true,
      trim: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: [true, 'Invoice reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than zero'],
    },
    payment_method: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['Bank Transfer', 'Credit Card', 'Cash', 'UPI'],
        message: '{VALUE} is not an accepted payment method',
      },
    },
    payment_date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ invoice: 1 });
paymentSchema.index({ payment_date: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
