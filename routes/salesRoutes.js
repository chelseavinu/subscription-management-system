import express from 'express';
import { getSalesOverview } from '../controllers/salesController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'staff'));

router.get('/overview', getSalesOverview);

export default router;
