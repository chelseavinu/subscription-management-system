import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect middleware:
 * Validates JWT Bearer token and attaches the authenticated user to req.user
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No token provided. Please include a valid Bearer token.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user from database without password field
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`[Auth Middleware] JWT verification failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Invalid or expired token.',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware:
 * Ensures the authenticated user possesses one of the allowed roles
 * @param  {...string} roles - e.g. 'admin', 'staff'
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Please log in first.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to perform this action. Required role: [${roles.join(', ')}].`,
      });
    }

    next();
  };
};

/**
 * Optional Auth middleware:
 * If a token is provided in the header, it decodes and attaches user to req.user.
 * If not provided, it simply continues without failing.
 * Useful for public endpoints where behavior changes if the requester is an admin.
 */
export const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // If optional token is invalid, we proceed as unauthenticated
  }

  next();
};

export default {
  protect,
  authorize,
  optionalAuth,
};
