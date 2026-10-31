const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Plan = require('../models/Plan');
const User = require('../models/User');

// Products CRUD helpers
router.get('/products', async (req, res, next) => {
  try {
    const products = await Product.find({ is_active: true });
    return res.status(200).json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

router.post('/products', async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();
    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Plans CRUD helpers
router.get('/plans', async (req, res, next) => {
  try {
    const plans = await Plan.find({ is_active: true });
    return res.status(200).json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
});

router.post('/plans', async (req, res, next) => {
  try {
    const plan = new Plan(req.body);
    await plan.save();
    return res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

// Customers helper
router.get('/customers', async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password_hash');
    return res.status(200).json({ success: true, data: customers });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
