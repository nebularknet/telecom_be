const jwt = require('jsonwebtoken');
const env = require('../config/env'); // Import centralized env
const {
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
} = require('../utils/errors');
const { permissions: permissionsMap } = require('../config/permissions'); // Load the map

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(new UnauthorizedError('Access denied. No token provided.'));
    }

    // jwt.verify runs synchronously if no callback is passed.
    // It will throw an error if verification fails (e.g. signature invalid, token expired)
    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = decoded; // Attach payload to request
    console.info(
      `Auth Middleware: Token verified successfully for user ${req.user.email || req.user.userId}`,
    );
    next();
  } catch (error) {
    console.warn(`Auth Middleware: Token verification failed. Error: ${error.message}`);
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Access denied. Token has expired.'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ForbiddenError('Access denied. Invalid token.'));
    }
    // For other unexpected errors during token verification
    next(error);
  }
};

// Optional: Middleware to check if the authenticated user is an admin
const isAdmin = (req, res, next) => {
  // This middleware should run *after* authenticateToken
  if (!req.user) {
    // This should ideally not happen if authenticateToken runs first and succeeds
    console.error(
      'Authorization Middleware (isAdmin): req.user not found. Ensure authenticateToken runs first.',
    );
    return next(
      new InternalServerError('Authorization error: User information missing.'),
    );
  }

  if (req.user.role !== 'admin') {
    console.warn(
      `Authorization Middleware (isAdmin): Access denied for user ${req.user.email || req.user.userId}. Role: ${req.user.role}. Admin required.`,
    );
    return next(new ForbiddenError('Access denied. Admin privileges required.'));
  }

  // User has admin role, proceed
  console.info(
    `Authorization Middleware (isAdmin): Admin access granted for user ${req.user.email || req.user.userId}.`,
  );
  next();
};

module.exports = {
  authenticateToken,
  isAdmin,
  checkPermission,
};

/**
 * Middleware factory to check if an authenticated user has a specific permission.
 * This function returns a middleware that can be used in routes.
 * It relies on `req.user` being populated by a preceding authentication middleware (e.g., `authenticateToken`),
 * which should include `req.user.role`.
 * Permissions are looked up from the `permissionsMap` imported from `../config/permissions.js`.
 *
 * @function checkPermission
 * @param {string} requiredPermission - The permission string required to access the route.
 * @returns {function} An Express middleware function `(req, res, next)`.
 */
function checkPermission(requiredPermission) {
  /**
   * Express middleware to verify user permission.
   * @param {object} req - Express request object, expected to have `req.user.role`.
   * @param {object} res - Express response object.
   * @param {function} next - Express next middleware function.
   */
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      // This should ideally be caught by authenticateToken first if it's a required auth route
      return next(new UnauthorizedError('Authentication required. User role not found for permission check.'));
    }

    const userRole = req.user.role;
    const userPermissions = permissionsMap[userRole] || [];

    if (userPermissions.includes(requiredPermission)) {
      return next(); // User has the permission, proceed
    }

    // User does not have the permission
    console.warn(
      `Authorization Middleware (checkPermission): Permission '${requiredPermission}' denied for user ${req.user.email || req.user.userId} (Role: ${userRole}).`,
    );
    return next(
      new ForbiddenError('You do not have permission to perform this action.'),
    );
  };
}
