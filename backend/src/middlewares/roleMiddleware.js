/**
 * @fileoverview Role-based access control middleware
 * @module middlewares/roleMiddleware
 * @description Provides middleware functions for role verification and authorization
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Enhanced JWT middleware that extracts full user object including role
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @description
 * Extracts JWT token from Authorization header and decodes payload.
 * Sets req.user with full user object including id and role.
 *
 * This is an enhanced version of jwtTokenMiddleware that includes role information.
 */
export function jwtWithRoleMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Token missing'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token'
      });
    }

    // Set full user object with both id and role
    req.user = {
      id: payload.id,
      role: payload.role || 'buyer' // Default to buyer if role not in token
    };

    next();
  });
}

/**
 * Middleware to ensure user has 'seller' role
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @description
 * Should be used after jwtWithRoleMiddleware.
 * Checks if req.user.role is 'seller'.
 *
 * @example
 * router.post('/products', jwtWithRoleMiddleware, requireSeller, createProduct);
 */
export function requireSeller(req, res, next) {
  if (!req.user || req.user.role !== 'seller') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Seller role required'
    });
  }
  next();
}

/**
 * Middleware to ensure user has 'admin' or 'super_admin' role
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @description
 * Should be used after jwtWithRoleMiddleware.
 * Checks if req.user.role is 'admin' or 'super_admin'.
 *
 * @example
 * router.post('/orders/:id/refund', jwtWithRoleMiddleware, requireAdmin, refundOrder);
 */
export function requireAdmin(req, res, next) {
  if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin role required'
    });
  }
  next();
}

/**
 * Middleware to ensure user has 'buyer' role
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @description
 * Should be used after jwtWithRoleMiddleware.
 * Checks if req.user.role is 'buyer'.
 */
export function requireBuyer(req, res, next) {
  if (!req.user || req.user.role !== 'buyer') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Buyer role required'
    });
  }
  next();
}

/**
 * Middleware factory to check for any of the specified roles
 *
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware function
 *
 * @example
 * router.post('/orders/:id/confirm', jwtWithRoleMiddleware, requireAnyRole(['buyer', 'seller', 'admin']), confirmOrder);
 */
export function requireAnyRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: One of the following roles required: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
}
