const express = require('express');
const router = express.Router();

const subscriptionRoutes = require('./subscriptionRoutes');
const billingRoutes = require('./billingRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const paymentRoutes = require('./paymentRoutes');
const discountRoutes = require('./discountRoutes');
const catalogRoutes = require('./catalogRoutes');

router.get(['/', ''], (req, res) => {
  res.status(200).json({
    name: 'Brightloop Software API',
    description: 'Subscription Management and Recurring Billing Platform',
    version: '1.0.0',
    success: true,
    message: 'Brightloop Platform API is live and operational',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      plans: '/api/plans',
      subscriptions: '/api/subscriptions',
      invoices: '/api/invoices',
      payments: '/api/payments',
      analytics: '/api/analytics'
    }
  });
});

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
    service: 'Brightloop Subscription & Billing Automation Engine (Member 2)',
    version: '1.0.0'
  });
});

module.exports = router;
