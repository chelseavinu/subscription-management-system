import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/catalogController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// Product Catalog Routes
// ==========================================

// GET /api/products - List all products with variants (public/authenticated)
// POST /api/products - Create product with variants (restricted to Admin)
router
  .route('/products')
  .get(getProducts)
  .post(protect, authorize('admin'), createProduct);

router
  .route('/products/:id')
  .get(getProductById)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

// ==========================================
// Plan Catalog Routes
// ==========================================

// GET /api/plans - List active billing plans
// POST /api/plans - Create billing plan (restricted to Admin)
router
  .route('/plans')
  .get(getPlans)
  .post(protect, authorize('admin'), createPlan);

router
  .route('/plans/:id')
  .get(getPlanById)
  .put(protect, authorize('admin'), updatePlan)
  .delete(protect, authorize('admin'), deletePlan);

export default router;
