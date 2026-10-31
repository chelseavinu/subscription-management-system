const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'brightloop_super_secret_jwt_key_2026_odoo_hackathon';

/**
 * Validates password complexity:
 * - > 8 characters
 * - Uppercase letter
 * - Lowercase letter
 * - Special character
 */
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length <= 8) {
    return { valid: false, message: 'Password must be strictly greater than 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z)' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z)' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...)' };
  }
  return { valid: true };
}

/**
 * Generates signed JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, company, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    // Role check: Only admin can create staff/admin accounts
    let assignedRole = 'customer';
    if (role && (role === 'staff' || role === 'admin')) {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only system administrators can create staff or admin accounts'
        });
      }
      assignedRole = role;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      role: assignedRole,
      company,
      phone,
      address
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare bcrypt hash or fallback to direct match for seeded demo users
    let isMatch = false;
    if (user.password_hash.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      isMatch = (user.password_hash === password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    const resetUrl = `http://localhost:5000/reset-password?token=${resetToken}`;

    return res.status(200).json({
      success: true,
      message: `Password reset link simulated and dispatched to ${user.email}`,
      reset_url: resetUrl
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id || req.user._id).select('-password_hash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
