const mongoose = require('mongoose');

/**
 * Reusable Request Validation Middleware
 */

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Validates subscription creation payload
 */
exports.validateCreateSubscription = (req, res, next) => {
  const { customer_id, customer_name, customer_email, plan_id, items, billing_interval, payment_terms } = req.body;
  const errors = [];

  if (!customer_id && (!customer_name || !customer_email)) {
    errors.push('Either customer_id or both customer_name and customer_email are required');
  }

  if (customer_id && !isValidObjectId(customer_id)) {
    errors.push('customer_id must be a valid MongoDB ObjectId');
  }

  if (!plan_id) {
    errors.push('plan_id is required');
  } else if (!isValidObjectId(plan_id)) {
    errors.push('plan_id must be a valid MongoDB ObjectId');
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('items must be a non-empty array of subscription lines');
  } else {
    items.forEach((item, index) => {
      if (!item.product_id && !item.product_name) {
        errors.push(`Item at index ${index} must have product_id or product_name`);
      }
      if (item.product_id && !isValidObjectId(item.product_id)) {
        errors.push(`Item at index ${index} product_id must be a valid MongoDB ObjectId`);
      }
      if (item.quantity !== undefined && (typeof item.quantity !== 'number' || item.quantity <= 0)) {
        errors.push(`Item at index ${index} quantity must be a positive number`);
      }
    });
  }

  const validIntervals = ['daily', 'weekly', 'monthly', 'yearly'];
  if (billing_interval && !validIntervals.includes(billing_interval.toLowerCase())) {
    errors.push(`billing_interval must be one of: ${validIntervals.join(', ')}`);
  }

  const validTerms = ['immediate', 'net_15', 'net_30', 'net_60'];
  if (payment_terms && !validTerms.includes(payment_terms.toLowerCase())) {
    errors.push(`payment_terms must be one of: ${validTerms.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

/**
 * Validates subscription state transition payload
 */
exports.validateTransitionStatus = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['draft', 'quotation', 'confirmed', 'active', 'paused', 'closed'];

  if (!status) {
    return res.status(400).json({ success: false, message: 'Target status is required' });
  }

  if (!validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Invalid status '${status}'. Must be one of: [${validStatuses.join(', ')}]`
    });
  }

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid subscription ID format' });
  }

  next();
};

/**
 * Validates billing run payload
 */
exports.validateBillingRun = (req, res, next) => {
  const { target_date } = req.body;
  if (target_date && isNaN(new Date(target_date).getTime())) {
    return res.status(400).json({ success: false, message: 'target_date must be a valid ISO date string' });
  }
  next();
};

/**
 * Validates payment recording payload
 */
exports.validateRecordPayment = (req, res, next) => {
  const { invoice_id, amount, payment_method } = req.body;
  const errors = [];

  if (!invoice_id) {
    errors.push('invoice_id is required');
  } else if (!isValidObjectId(invoice_id)) {
    errors.push('invoice_id must be a valid MongoDB ObjectId');
  }

  if (amount === undefined || amount === null || typeof Number(amount) !== 'number' || isNaN(Number(amount)) || Number(amount) <= 0) {
    errors.push('amount must be a positive number greater than 0');
  }

  const validMethods = ['bank_transfer', 'credit_card', 'stripe', 'cash', 'cheque', 'other'];
  if (payment_method && !validMethods.includes(payment_method.toLowerCase())) {
    errors.push(`payment_method must be one of: ${validMethods.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};

/**
 * Validates discount creation payload
 */
exports.validateCreateDiscount = (req, res, next) => {
  const { code, value, type } = req.body;
  const errors = [];

  if (!code || typeof code !== 'string' || !code.trim()) {
    errors.push('code is required and must be a non-empty string');
  }

  if (value === undefined || value === null || isNaN(Number(value)) || Number(value) <= 0) {
    errors.push('value must be a positive number greater than 0');
  }

  if (type && !['percentage', 'fixed'].includes(type.toLowerCase())) {
    errors.push("type must be either 'percentage' or 'fixed'");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  next();
};
