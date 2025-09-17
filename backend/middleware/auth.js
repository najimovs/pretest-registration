import jwt from 'jsonwebtoken';
import { getJWTSecret } from '../utils/adminAuth.js';
import logger from '../utils/logger.js';

// User authentication middleware
export const userAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, getJWTSecret());

    // For user tokens, we should have userId
    if (!decoded.userId) {
      logger.warn('User auth failed: Invalid token structure', {
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid token structure.'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('User auth failed: Invalid token', {
      error: error.message,
      ip: req.ip
    });
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};