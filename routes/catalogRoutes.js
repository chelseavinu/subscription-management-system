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

// GET  /api/products - List all products with variants (accessible by authenticated users: admin, staff, customer)
// POST /api/products - Create product with variants (restricted to Admin)
router
  .route('/products')
  .get(protect, getProducts)
  .post(protect, authorize('admin'), createProduct);

router
  .route('/products/:id')
  .get(protect, getProductById)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

// ==========================================
// Plan Catalog Routes
// ==========================================

// GET  /api/plans - List active billing plans (accessible by authenticated users)
// POST /api/plans - Create billing plan (restricted to Admin)
router
  .route('/plans')
  .get(protect, getPlans)
  .post(protect, authorize('admin'), createPlan);

router
  .route('/plans/:id')
  .get(protect, getPlanById)
  .put(protect, authorize('admin'), updatePlan)
  .delete(protect, authorize('admin'), deletePlan);

export default router;
