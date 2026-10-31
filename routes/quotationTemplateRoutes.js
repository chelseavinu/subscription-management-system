import express from 'express';
import {
  getQuotationTemplates,
  getQuotationTemplateById,
  createQuotationTemplate,
} from '../controllers/quotationTemplateController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getQuotationTemplates)
  .post(authorize('admin', 'staff'), createQuotationTemplate);

router
  .route('/:id')
  .get(getQuotationTemplateById);

export default router;
