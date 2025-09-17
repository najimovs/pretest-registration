import { body, validationResult } from 'express-validator';
import logger from '../utils/logger.js';

// Validation middleware to check for errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation error:', {
      errors: errors.array(),
      ip: req.ip,
      url: req.url
    });

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
export const validateRegistration = [
  body('user.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0400-\u04FF\s'-]+$/)
    .withMessage('First name must be 2-50 characters and contain only letters'),

  body('user.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-ZÀ-ÿ\u0100-\u017F\u0400-\u04FF\s'-]+$/)
    .withMessage('Last name must be 2-50 characters and contain only letters'),

  body('user.phone')
    .matches(/^\+998\d{9}$/)
    .withMessage('Phone number must be in format +998xxxxxxxxx'),

  body('user.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),

  body('user.password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be 6-128 characters long'),

  handleValidationErrors
];

// User login validation
export const validateLogin = [
  body('phone')
    .matches(/^\+998\d{9}$/)
    .withMessage('Phone number must be in format +998xxxxxxxxx'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Admin login validation
export const validateAdminLogin = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-50 characters and contain only letters, numbers, _ or -'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Payment validation
export const validatePayment = [
  body('registrationId')
    .isMongoId()
    .withMessage('Invalid registration ID'),

  handleValidationErrors
];

// Schedule update validation
export const validateScheduleUpdate = [
  body('schedule.date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in ISO format'),

  body('schedule.time')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),

  handleValidationErrors
];