import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  getCustomers,
} from '../controllers/authController.js';
import { protect, optionalAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public registration (or Admin-authenticated for staff/admin role creation)
router.post('/register', optionalAuth, register);

// Login and token generation
router.post('/login', login);

// Forgot password & reset password endpoints
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Current user profile & account management
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

// Customers list for Sales Staff and Admin
router.get('/customers', protect, authorize('admin', 'staff'), getCustomers);

export default router;
