const Invoice = require('../models/Invoice');
const invoiceService = require('../services/invoiceService');

/**
 * Controller for Invoices and Billing Documents
 */
exports.getAllInvoices = async (req, res, next) => {
  try {
    const { status, payment_status, customer_id, subscription_id, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (payment_status) filter.payment_status = payment_status;
    if (customer_id) filter.customer_id = customer_id;
    if (subscription_id) filter.subscription_id = subscription_id;
    if (search) {
      filter.$or = [
        { invoice_number: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } },
        { customer_email: { $regex: search, $options: 'i' } },
        { subscription_number: { $regex: search, $options: 'i' } }
      ];
    }

    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Invoice.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('subscription_id')
      .populate('customer_id');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    return res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

exports.confirmInvoice = async (req, res, next) => {
  try {
    const user = req.user ? req.user.name : (req.body.user || 'Team Member');
    const invoice = await invoiceService.confirmInvoice(req.params.id, user);
    return res.status(200).json({
      success: true,
      message: `Invoice ${invoice.invoice_number} confirmed`,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelInvoice = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by staff' } = req.body;
    const user = req.user ? req.user.name : 'Team Member';
    const invoice = await invoiceService.cancelInvoice(req.params.id, reason, user);
    return res.status(200).json({
      success: true,
      message: `Invoice ${invoice.invoice_number} cancelled`,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

exports.sendInvoice = async (req, res, next) => {
  try {
    const result = await invoiceService.sendInvoice(req.params.id);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getPrintData = async (req, res, next) => {
  try {
    const data = await invoiceService.getPrintableInvoice(req.params.id);
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
