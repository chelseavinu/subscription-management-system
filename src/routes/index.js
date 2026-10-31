const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const billingRoutes = require('./billingRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const paymentRoutes = require('./paymentRoutes');
const discountRoutes = require('./discountRoutes');
const catalogRoutes = require('./catalogRoutes');

// Member 1 Routes
router.use('/auth', authRoutes);
router.use('/products', catalogRoutes);
router.use('/plans', catalogRoutes);

// Member 2 Routes
router.use('/subscriptions', subscriptionRoutes);
router.use('/billing', billingRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/discounts', discountRoutes);
router.use('/catalog', catalogRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'Brightloop Subscription & Billing Automation Engine (Unified)',
    version: '1.0.0'
  });
});

module.exports = router;
