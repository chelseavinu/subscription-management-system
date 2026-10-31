import express from 'express';
import authRoutes from './authRoutes.js';
import catalogRoutes from './catalogRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import quotationTemplateRoutes from './quotationTemplateRoutes.js';
import salesRoutes from './salesRoutes.js';
import { getCustomers } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Mount authentication routes at /api/auth
router.use('/auth', authRoutes);

// Mount catalog routes (products and plans) at /api
router.use('/', catalogRoutes);

// Mount subscription lifecycle routes at /api/subscriptions
router.use('/subscriptions', subscriptionRoutes);

// Mount invoice routes at /api/invoices
router.use('/invoices', invoiceRoutes);

// Mount payment routes at /api/payments
router.use('/payments', paymentRoutes);

// Mount analytics routes at /api/analytics
router.use('/analytics', analyticsRoutes);

// Mount quotation templates routes at /api/quotation-templates
router.use('/quotation-templates', quotationTemplateRoutes);

// Mount sales workspace overview at /api/sales
router.use('/sales', salesRoutes);

// Mount direct customers endpoint at /api/customers for sales staff
router.get('/customers', protect, authorize('admin', 'staff'), getCustomers);

// System health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Brightloop Software API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

export default router;
