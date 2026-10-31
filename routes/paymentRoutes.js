import express from 'express';
import {
  getPayments,
  recordPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getPayments)
  .post(recordPayment);

export default router;
