import Invoice from '../models/Invoice.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

/**
 * @desc    Get all invoices with filtering
 * @route   GET /api/invoices
 * @access  Private
 */
export const getInvoices = async (req, res, next) => {
  try {
    const query = {};

    // Customer can only view their own invoices
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.query.customer) {
      query.customer = req.query.customer;
    }

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    if (req.query.subscription) {
      query.subscription = req.query.subscription;
    }

    if (req.query.search) {
      query.invoice_number = { $regex: req.query.search, $options: 'i' };
    }

    const invoices = await Invoice.find(query)
      .populate('customer', 'name email role')
      .populate('subscription', 'subscription_number plan')
      .populate('items.product', 'name type')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single invoice by ID
 * @route   GET /api/invoices/:id
 * @access  Private
 */
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email role')
      .populate('subscription', 'subscription_number plan')
      .populate('items.product', 'name type sales_price');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: `Invoice not found with id: ${req.params.id}`,
      });
    }

    if (req.user.role === 'customer' && invoice.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot view invoices belonging to other customers.',
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update invoice status (Draft -> Confirmed -> Paid -> Overdue)
 * @route   PATCH /api/invoices/:id/status
 * @access  Private (Admin, Staff)
 */
export const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Draft', 'Confirmed', 'Paid', 'Overdue'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: `Invoice not found with id: ${req.params.id}`,
      });
    }

    invoice.status = status;
    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customer', 'name email role')
      .populate('subscription', 'subscription_number');

    return res.status(200).json({
      success: true,
      message: `Invoice status updated to ${status}`,
      data: populatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};
