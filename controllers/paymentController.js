import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';

/**
 * @desc    Get all payments
 * @route   GET /api/payments
 * @access  Private
 */
export const getPayments = async (req, res, next) => {
  try {
    const query = {};

    if (req.query.invoice) {
      query.invoice = req.query.invoice;
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'invoice',
        populate: [
          { path: 'customer', select: 'name email' },
          { path: 'subscription', select: 'subscription_number' },
        ],
      })
      .sort({ payment_date: -1 });

    // Filter for customer role
    const filteredPayments = req.user.role === 'customer'
      ? payments.filter((p) => p.invoice && p.invoice.customer && p.invoice.customer._id.toString() === req.user._id.toString())
      : payments;

    return res.status(200).json({
      success: true,
      count: filteredPayments.length,
      data: filteredPayments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record new payment against an invoice
 * @route   POST /api/payments
 * @access  Private (Admin, Staff, or Customer paying their invoice)
 */
export const recordPayment = async (req, res, next) => {
  try {
    const { invoice_id, amount, payment_method, notes } = req.body;

    const invoice = await Invoice.findById(invoice_id).populate('customer');
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Role check for customer
    if (req.user.role === 'customer' && invoice.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot pay invoices for other accounts.',
      });
    }

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be a positive number.',
      });
    }

    const newPayment = await Payment.create({
      invoice: invoice._id,
      amount: paymentAmount,
      payment_method,
      notes: notes || `Payment recorded via ${payment_method}`,
      payment_date: new Date(),
    });

    // Check total payments against this invoice
    const allPayments = await Payment.find({ invoice: invoice._id });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    // If fully paid or exceeds total, mark as Paid
    if (totalPaid >= invoice.total_amount) {
      invoice.status = 'Paid';
      await invoice.save();
    }

    const populatedPayment = await Payment.findById(newPayment._id)
      .populate({
        path: 'invoice',
        populate: { path: 'customer', select: 'name email' },
      });

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payment: populatedPayment,
        invoice_status: invoice.status,
        total_paid: totalPaid,
        remaining_balance: Math.max(0, invoice.total_amount - totalPaid),
      },
    });
  } catch (error) {
    next(error);
  }
};
