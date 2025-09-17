import express from 'express';
import jwt from 'jsonwebtoken';
import Registration from '../models/Registration.js';
import logger from '../utils/logger.js';
import { verifyAdminPassword, createAdminToken, verifyAdminToken, getJWTSecret } from '../utils/adminAuth.js';
import { validateRegistration, validateLogin, validateAdminLogin, validateScheduleUpdate } from '../middleware/validation.js';
import { userAuth } from '../middleware/auth.js';

const router = express.Router();

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Admin auth failed: No token provided', {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAdminToken(token);

    if (decoded.role !== 'admin') {
      logger.warn('Admin auth failed: Invalid role', {
        role: decoded.role,
        ip: req.ip
      });
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    logger.warn('Admin auth failed: Invalid token', {
      error: error.message,
      ip: req.ip
    });
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

// Create new registration
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { user, schedule } = req.body;

    // Registration request received

    // Check if phone number already exists
    const existingRegistration = await Registration.findOne({
      'user.phone': user.phone
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: 'Phone number already registered',
        code: 'PHONE_EXISTS',
        data: {
          existingUser: {
            firstName: existingRegistration.user.firstName,
            lastName: existingRegistration.user.lastName,
            phone: existingRegistration.user.phone,
            registeredAt: existingRegistration.createdAt,
            status: existingRegistration.status,
            paymentStatus: existingRegistration.paymentStatus
          }
        }
      });
    }

    const registration = new Registration({
      user,
      schedule: schedule || {
        date: null,
        time: null
      },
      status: 'pending' // Keep as pending until payment is completed
    });

    await registration.save();

    // Debug: Log what was actually saved
    // Registration saved successfully

    res.status(201).json({
      success: true,
      message: 'Registration created successfully',
      data: {
        user: {
          id: registration._id,
          firstName: registration.user.firstName,
          lastName: registration.user.lastName,
          phone: registration.user.phone,
          email: registration.user.email
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create registration',
      error: error.message
    });
  }
});

// Get all registrations (for admin)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        registrations,
        count: registrations.length
      }
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
});

// Update existing registration with schedule (for existing users scheduling tests)
router.put('/:id/schedule', validateScheduleUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;

    const registration = await Registration.findByIdAndUpdate(
      id,
      {
        schedule: schedule,
        status: 'pending', // Keep as pending until payment is completed
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: {
        user: {
          id: registration._id,
          firstName: registration.user.firstName,
          lastName: registration.user.lastName,
          phone: registration.user.phone,
          email: registration.user.email
        }
      }
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule',
      error: error.message
    });
  }
});

// Update existing registration with schedule by phone (for existing users scheduling tests)
router.put('/schedule/by-phone', async (req, res) => {
  try {
    const { phone, schedule } = req.body;

    const registration = await Registration.findOneAndUpdate(
      { 'user.phone': phone },
      {
        schedule: schedule,
        status: 'pending', // Keep as pending until payment is completed
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found for this phone number'
      });
    }

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: {
        user: {
          id: registration._id,
          firstName: registration.user.firstName,
          lastName: registration.user.lastName,
          phone: registration.user.phone,
          email: registration.user.email
        }
      }
    });
  } catch (error) {
    console.error('Update schedule by phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule',
      error: error.message
    });
  }
});

// Update registration status (admin only)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const registration = await Registration.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: registration
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
});

// Delete registration (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findByIdAndDelete(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Registration deleted successfully'
    });
  } catch (error) {
    console.error('Delete registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete registration',
      error: error.message
    });
  }
});

// User login endpoint
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required'
      });
    }

    // Find user by phone number
    const registration = await Registration.findOne({
      'user.phone': phone
    });

    if (!registration) {
      logger.warn('Login attempt for non-existent user', {
        phone: phone.replace(/\d{4}$/, '****'), // Partial phone for privacy
        ip: req.ip
      });
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user has a password (backward compatibility)
    if (!registration.user.password) {
      logger.warn('Login attempt for account without password', {
        registrationId: registration._id,
        ip: req.ip
      });
      return res.status(400).json({
        success: false,
        message: 'This account was created before password support. Please register again with a password.',
        code: 'NO_PASSWORD_SET'
      });
    }

    // Check password
    const isPasswordValid = await registration.comparePassword(password);

    if (!isPasswordValid) {
      logger.warn('Failed login attempt - invalid password', {
        registrationId: registration._id,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
        code: 'INVALID_PASSWORD'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: registration._id,
        phone: registration.user.phone,
        issuedAt: Date.now()
      },
      getJWTSecret(),
      { expiresIn: '7d' }
    );

    logger.info('Successful user login', {
      userId: registration._id,
      phone: phone.replace(/\d{4}$/, '****'),
      ip: req.ip
    });

    // Return user data (without password)
    const userData = {
      id: registration._id,
      firstName: registration.user.firstName,
      lastName: registration.user.lastName,
      phone: registration.user.phone,
      email: registration.user.email
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        registration: {
          id: registration._id,
          status: registration.status,
          paymentStatus: registration.paymentStatus,
          schedule: registration.schedule,
          createdAt: registration.createdAt
        },
        token: token
      }
    });

  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Admin login endpoint
router.post('/admin/login', validateAdminLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    // Check if admin password hash is configured
    if (!adminPasswordHash) {
      logger.error('Admin password hash not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Validate username
    if (username !== adminUsername) {
      logger.warn('Admin login failed - invalid username', {
        attemptedUsername: username,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await verifyAdminPassword(password, adminPasswordHash);
    if (!isPasswordValid) {
      logger.warn('Admin login failed - invalid password', {
        username,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate secure admin token
    const adminToken = createAdminToken(username);

    logger.info('Successful admin login', {
      username,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        username,
        token: adminToken,
        role: 'admin',
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours
      }
    });
  } catch (error) {
    logger.error('Admin login error:', {
      error: error.message,
      ip: req.ip
    });
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// User profile endpoints
// Get user profile
router.get('/user/profile', userAuth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.user.userId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return user data without sensitive information
    const userData = {
      id: registration._id,
      firstName: registration.user.firstName,
      lastName: registration.user.lastName,
      phone: registration.user.phone,
      email: registration.user.email
    };

    res.json({
      success: true,
      data: {
        user: userData,
        registration: {
          id: registration._id,
          status: registration.status,
          paymentStatus: registration.paymentStatus,
          schedule: registration.schedule,
          createdAt: registration.createdAt
        }
      }
    });

  } catch (error) {
    logger.error('Get user profile error:', {
      error: error.message,
      userId: req.user.userId,
      ip: req.ip
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// Update user profile
router.put('/user/profile/update', userAuth, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    // Validate input
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and phone are required'
      });
    }

    // Check if new phone number is already taken by another user
    if (phone !== req.user.phone) {
      const existingUser = await Registration.findOne({
        'user.phone': phone,
        _id: { $ne: req.user.userId }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Phone number already in use by another user'
        });
      }
    }

    // Update user profile
    const registration = await Registration.findByIdAndUpdate(
      req.user.userId,
      {
        'user.firstName': firstName,
        'user.lastName': lastName,
        'user.phone': phone,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info('User profile updated', {
      userId: req.user.userId,
      ip: req.ip
    });

    // Return updated user data
    const userData = {
      id: registration._id,
      firstName: registration.user.firstName,
      lastName: registration.user.lastName,
      phone: registration.user.phone,
      email: registration.user.email
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userData
      }
    });

  } catch (error) {
    logger.error('Update user profile error:', {
      error: error.message,
      userId: req.user.userId,
      ip: req.ip
    });
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get user tests (for enrollment page)
router.get('/user/tests', userAuth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.user.userId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return user's test schedule
    res.json({
      success: true,
      data: {
        tests: registration.schedule ? [registration.schedule] : [],
        registration: {
          id: registration._id,
          status: registration.status,
          paymentStatus: registration.paymentStatus,
          schedule: registration.schedule
        }
      }
    });

  } catch (error) {
    logger.error('Get user tests error:', {
      error: error.message,
      userId: req.user.userId,
      ip: req.ip
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get user tests'
    });
  }
});

export default router;