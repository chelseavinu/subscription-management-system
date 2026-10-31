import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
} from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getInvoices);

router
  .route('/:id')
  .get(getInvoiceById);

router
  .route('/:id/status')
  .patch(authorize('admin', 'staff'), updateInvoiceStatus);

export default router;
