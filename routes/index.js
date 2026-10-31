import express from 'express';
import authRoutes from './authRoutes.js';
import catalogRoutes from './catalogRoutes.js';

const router = express.Router();

// Mount authentication routes at /api/auth
router.use('/auth', authRoutes);

// Mount catalog routes (products and plans) at /api
router.use('/', catalogRoutes);

// System health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Brightloop Software API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

export default router;
