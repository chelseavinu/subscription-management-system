const Payment = require('../models/Payment');
const paymentService = require('../services/paymentService');

/**
 * Controller for Payment Recording & Invoice Reconciliation
 */
exports.recordPayment = async (req, res, next) => {
  try {
    const result = await paymentService.recordPayment(req.body);
    return res.status(201).json({
      success: true,
      message: `Payment of $${result.payment.amount} recorded for Invoice ${result.invoice.invoice_number}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentsByInvoice = async (req, res, next) => {
  try {
    const payments = await paymentService.getPaymentsByInvoice(req.params.invoiceId);
    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPayments = async (req, res, next) => {
  try {
    const { payment_method, status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (payment_method) filter.payment_method = payment_method;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { payment_number: { $regex: search, $options: 'i' } },
        { invoice_number: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } },
        { transaction_reference: { $regex: search, $options: 'i' } }
      ];
    }

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Payment.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: payments.length,
      total,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};
