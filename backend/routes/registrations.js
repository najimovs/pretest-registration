import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Registration from '../models/Registration.js';

const router = express.Router();

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');

    // Check if it's an admin token
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Create new registration
router.post('/register', async (req, res) => {
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
router.put('/:id/schedule', async (req, res) => {
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
router.post('/login', async (req, res) => {
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
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user has a password (new feature)
    if (!registration.user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was created before password support. Please register again with a password.',
        code: 'NO_PASSWORD_SET'
      });
    }

    // Check password
    const isPasswordValid = await registration.comparePassword(password);

    if (!isPasswordValid) {
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
        phone: registration.user.phone
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

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
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate credentials against environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'pretest2025';

    // Debug log to see what credentials are being used
    console.log('Login attempt:', { username, password });
    console.log('Expected:', { adminUsername, adminPassword });

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token for admin
    const adminToken = jwt.sign(
      {
        adminId: 'admin',
        username: username,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        username,
        token: adminToken,
        role: 'admin',
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

export default router;