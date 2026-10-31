import express from 'express';
import {
  register,
  login,
  forgotPassword,
  getMe,
} from '../controllers/authController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public registration (or Admin-authenticated for staff/admin role creation)
router.post('/register', optionalAuth, register);

// Login and token generation
router.post('/login', login);

// Mock forgot password endpoint
router.post('/forgot-password', forgotPassword);

// Current user profile
router.get('/me', protect, getMe);

export default router;
