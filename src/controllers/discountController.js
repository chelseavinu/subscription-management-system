const Discount = require('../models/Discount');
const discountService = require('../services/discountService');

/**
 * Controller for Discounts & Promotional Rules
 */
exports.createDiscount = async (req, res, next) => {
  try {
    const { code, type, value, min_qty, min_amount, max_discount_amount, expiry_date, usage_limit, description } = req.body;
    
    if (!code || !value) {
      return res.status(400).json({ success: false, message: 'Discount code and value are required' });
    }

    const discount = new Discount({
      code: code.trim().toUpperCase(),
      type: type || 'percentage',
      value: Number(value),
      min_qty: Number(min_qty) || 0,
      min_amount: Number(min_amount) || 0,
      max_discount_amount: max_discount_amount ? Number(max_discount_amount) : undefined,
      expiry_date: expiry_date ? new Date(expiry_date) : undefined,
      usage_limit: usage_limit ? Number(usage_limit) : null,
      description
    });

    await discount.save();

    return res.status(201).json({
      success: true,
      message: `Discount code '${discount.code}' created successfully`,
      data: discount
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Discount code already exists' });
    }
    next(error);
  }
};

exports.validateDiscount = async (req, res, next) => {
  try {
    const { code, subtotal = 0, total_quantity = 1 } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }

    const result = await discountService.validateAndCalculate(code, Number(subtotal), Number(total_quantity));
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.reason });
    }

    return res.status(200).json({
      success: true,
      message: 'Discount is valid and applied',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllDiscounts = async (req, res, next) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: discounts.length,
      data: discounts
    });
  } catch (error) {
    next(error);
  }
};
