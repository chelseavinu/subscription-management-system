import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Helper to generate signed JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Helper to validate password security rules:
 * - Strictly > 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one special character
 */
export const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length <= 8) {
    return {
      valid: false,
      message: 'Password must be strictly greater than 8 characters',
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUppercase) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter (A-Z)',
    };
  }

  if (!hasLowercase) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter (a-z)',
    };
  }

  if (!hasSpecial) {
    return {
      valid: false,
      message: 'Password must contain at least one special character (!@#$%^&*...)',
    };
  }

  return { valid: true };
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public (Customer) / Admin (for creating Staff or Admin)
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // 1. Password validation rules
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // 2. Prevent duplicate emails
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // 3. Role assignment check: Only admin can register/create 'staff' or 'admin'
    let assignedRole = 'customer';
    if (role && role !== 'customer') {
      if (['staff', 'admin'].includes(role)) {
        // Must be an authenticated admin to assign staff or admin role
        if (!req.user || req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Only administrators can create staff or admin users',
          });
        }
        assignedRole = role;
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid role specified: ${role}. Valid roles are 'customer', 'staff', 'admin'`,
        });
      }
    }

    // 4. Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: assignedRole,
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mock forgot-password endpoint
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user registered with this email address',
      });
    }

    // Generate mock reset token & dummy reset link
    const mockToken = crypto.randomBytes(32).toString('hex');
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password?token=${mockToken}`;

    console.log('----------------------------------------------------');
    console.log(`[AUTH FORGOT PASSWORD MOCK]`);
    console.log(`Target User: ${user.name} (${user.email})`);
    console.log(`Mock Reset Token: ${mockToken}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('----------------------------------------------------');

    return res.status(200).json({
      success: true,
      message: 'Password reset link generated and logged to console',
      data: {
        email: user.email,
        mockToken,
        resetUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details (Customer Account Settings)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) {
      user.name = req.body.name.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password (Authenticated)
 * @route   POST /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password provided is incorrect',
      });
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password (Public reset workflow)
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and new password',
      });
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user account found with this email address',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all customers (for Staff quotation creation)
 * @route   GET /api/customers
 * @access  Private (Admin, Staff)
 */
export const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('name email role createdAt')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  getCustomers,
  validatePasswordStrength,
};

