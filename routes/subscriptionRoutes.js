import express from 'express';
import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscriptionStatus,
  generateInvoiceForSubscription,
} from '../controllers/subscriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSubscriptions)
  .post(createSubscription);

router
  .route('/:id')
  .get(getSubscriptionById);

router
  .route('/:id/status')
  .patch(authorize('admin', 'staff'), updateSubscriptionStatus)
  .post(authorize('admin', 'staff'), updateSubscriptionStatus);

router
  .route('/:id/transition')
  .post(authorize('admin', 'staff'), updateSubscriptionStatus);

router
  .route('/:id/generate-invoice')
  .post(authorize('admin', 'staff'), generateInvoiceForSubscription);

export default router;
