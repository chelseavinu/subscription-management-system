/**
 * Authentication and Role Authorization Middleware
 * Designed to seamlessly plug into Member 1's JWT or header-based auth
 */
function authMiddleware(req, res, next) {
  // 1. Support header overrides for rapid hackathon testing / Postman
  const headerRole = req.headers['x-user-role'];
  const headerUserId = req.headers['x-user-id'];
  const headerUserName = req.headers['x-user-name'];

  if (headerRole) {
    req.user = {
      _id: headerUserId || 'mock-user-id',
      name: headerUserName || 'Staff Member',
      role: headerRole.toLowerCase()
    };
    return next();
  }

  // 2. Support Bearer token parsing (JWT placeholder)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      // Basic base64 decode if JSON payload encoded or standard JWT format
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        req.user = {
          _id: payload.id || payload._id || payload.sub,
          name: payload.name || 'User',
          role: (payload.role || 'customer').toLowerCase()
        };
        return next();
      }
    } catch (e) {
      // If parsing fails, fall through to default guest/system user
    }
  }

  // Default fallback user for open dev/testing
  req.user = {
    _id: 'default-staff-id',
    name: 'Internal Staff',
    role: 'staff'
  };

  next();
}

/**
 * Role-based authorization guard
 * @param {Array<string>} allowedRoles 
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] roles`
      });
    }
    next();
  };
}

module.exports = {
  authMiddleware,
  requireRole
};
