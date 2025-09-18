import express from 'express';
import crypto from 'crypto';
import Registration from '../models/Registration.js';
import logger from '../utils/logger.js';
import { validatePayment } from '../middleware/validation.js';

const router = express.Router();

// Click payment configuration
const CLICK_CONFIG = {
  SERVICE_ID: parseInt(process.env.CLICK_SERVICE_ID) || 82886,
  MERCHANT_ID: parseInt(process.env.CLICK_MERCHANT_ID) || 46111,
  SECRET_KEY: process.env.CLICK_SECRET_KEY || '9TDkmspVHm7LZ',
  MERCHANT_USER_ID: parseInt(process.env.CLICK_MERCHANT_USER_ID) || 64082
};

// Application configuration
const APP_CONFIG = {
  TEST_AMOUNT: parseInt(process.env.TEST_AMOUNT) || 2000,
  DOMAIN: process.env.DOMAIN || 'localhost',
  PAYMENT_TIMEOUT_MINUTES: 15 // Payment expires after 15 minutes
};

// Validate configuration
if (!CLICK_CONFIG.SERVICE_ID || !CLICK_CONFIG.MERCHANT_ID || !CLICK_CONFIG.SECRET_KEY) {
  console.error('Missing required Click payment configuration. Please set CLICK_SERVICE_ID, CLICK_MERCHANT_ID, and CLICK_SECRET_KEY environment variables.');
}

// Helper function to create MD5 hash for Click (according to Click docs)
function createClickSignature(params, isPrepare = true) {
  let signString;
  if (isPrepare) {
    // For prepare: click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time
    signString = `${params.click_trans_id}${params.service_id}${CLICK_CONFIG.SECRET_KEY}${params.merchant_trans_id}${params.amount}${params.action}${params.sign_time}`;
  } else {
    // For complete: click_trans_id + service_id + SECRET_KEY + merchant_trans_id + merchant_prepare_id + amount + action + sign_time
    signString = `${params.click_trans_id}${params.service_id}${CLICK_CONFIG.SECRET_KEY}${params.merchant_trans_id}${params.merchant_prepare_id}${params.amount}${params.action}${params.sign_time}`;
  }
  return crypto.createHash('md5').update(signString).digest('hex');
}

// Validate Click signature
function validateClickSignature(params, receivedSignature, isPrepare = true) {
  const expectedSignature = createClickSignature(params, isPrepare);
  return expectedSignature === receivedSignature;
}

// Validate request origin (Click IP addresses)
function validateClickOrigin(req) {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

  // Get allowed IPs from environment
  const allowedIPs = process.env.CLICK_ALLOWED_IPS
    ? process.env.CLICK_ALLOWED_IPS.split(',').map(ip => ip.trim())
    : ['185.8.212.184', '185.8.212.185', '185.8.212.186'];

  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    allowedIPs.push('127.0.0.1', '::1', '::ffff:127.0.0.1');
  }

  const isAllowed = allowedIPs.some(ip => clientIP.includes(ip));

  if (!isAllowed) {
    logger.warn('Click request from unauthorized IP', {
      clientIP,
      allowedIPs,
      userAgent: req.headers['user-agent']
    });
  }

  return isAllowed;
}

// Clean up expired payments
async function cleanupExpiredPayments() {
  try {
    const now = new Date();
    const expiredPayments = await Registration.find({
      paymentStatus: 'prepared',
      'paymentInfo.expiresAt': { $lt: now }
    });

    for (const payment of expiredPayments) {
      payment.paymentStatus = 'failed';
      payment.status = 'pending'; // Reset to pending so user can try again
      await payment.save();

      logTransaction('PAYMENT_EXPIRED', {
        registration_id: payment._id,
        merchant_prepare_id: payment.paymentInfo?.merchantPrepareId,
        expired_at: payment.paymentInfo?.expiresAt
      }, 'warning');
    }

    if (expiredPayments.length > 0) {
      console.log(`Cleaned up ${expiredPayments.length} expired payments`);
    }
  } catch (error) {
    console.error('Error cleaning up expired payments:', error);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredPayments, 5 * 60 * 1000);

// Transaction logging function
function logTransaction(type, data, status = 'info') {
  const logData = {
    type,
    status,
    ...data,
    timestamp: new Date().toISOString()
  };

  // Use Winston logger with payments.log
  if (status === 'error') {
    logger.error(`Payment: ${type}`, logData);
  } else if (status === 'warning') {
    logger.warn(`Payment: ${type}`, logData);
  } else {
    logger.info(`Payment: ${type}`, logData);
  }
}

// Click Prepare endpoint - validates payment request
router.post('/click/prepare', async (req, res) => {
  try {
    const {
      click_trans_id,
      service_id,
      click_paydoc_id,
      merchant_trans_id,
      amount,
      action,
      sign_time,
      sign_string
    } = req.body;

    // Log incoming prepare request
    logTransaction('CLICK_PREPARE_REQUEST', {
      click_trans_id,
      merchant_trans_id,
      amount,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    // Click Prepare Request received

    // Validate request origin - enabled in production
    if (process.env.NODE_ENV === 'production' && !validateClickOrigin(req)) {
      logTransaction('CLICK_PREPARE_ERROR', {
        click_trans_id,
        merchant_trans_id,
        error: 'Invalid request origin',
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      }, 'error');
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_prepare_id: null,
        error: -9,
        error_note: "Invalid request origin"
      });
    }

    // Validate required fields
    if (!click_trans_id || !service_id || !click_paydoc_id || !merchant_trans_id || !amount || action === undefined || !sign_time || !sign_string) {
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_prepare_id: null,
        error: -8,
        error_note: "Required parameter missing"
      });
    }

    // Validate action value (must be 0 for prepare)
    if (parseInt(action) !== 0) {
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_prepare_id: null,
        error: -3,
        error_note: "Invalid action for prepare"
      });
    }

    // Validate signature
    if (!validateClickSignature(req.body, sign_string, true)) {
      logTransaction('CLICK_PREPARE_ERROR', {
        click_trans_id,
        merchant_trans_id,
        error: 'Invalid signature'
      }, 'error');
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_prepare_id: null,
        error: -1,
        error_note: "Invalid signature"
      });
    }

    // Validate service_id
    if (parseInt(service_id) !== CLICK_CONFIG.SERVICE_ID) {
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_prepare_id: null,
        error: -5,
        error_note: "Service ID is incorrect"
      });
    }

    // Find registration first to get the expected amount
    const registration = await Registration.findById(merchant_trans_id);
    if (!registration) {
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_prepare_id: null,
        error: -5,
        error_note: "Order not found"
      });
    }

    // Get expected amount from registration schedule data
    const expectedAmount = registration.schedule?.price || APP_CONFIG.TEST_AMOUNT;

    // Validate amount
    if (parseFloat(amount) !== expectedAmount) {
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_prepare_id: null,
        error: -2,
        error_note: "Incorrect amount"
      });
    }

    // Registration already found above during amount validation

    // Check if already paid
    if (registration.paymentStatus === 'completed') {
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_prepare_id: null,
        error: -4,
        error_note: "Already paid"
      });
    }

    // Create merchant_prepare_id (can be any unique identifier)
    const merchant_prepare_id = `prep_${Date.now()}_${registration._id}`;

    // Update registration with payment info
    const preparedAt = new Date();
    const expiresAt = new Date(preparedAt.getTime() + APP_CONFIG.PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

    registration.paymentInfo = {
      clickTransId: click_trans_id,
      merchantPrepareId: merchant_prepare_id,
      amount: amount,
      preparedAt: preparedAt,
      expiresAt: expiresAt
    };
    registration.paymentStatus = 'prepared';
    await registration.save();

    // Log successful prepare
    logTransaction('CLICK_PREPARE_SUCCESS', {
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id,
      registration_id: registration._id
    }, 'success');

    // Successful prepare response
    res.json({
      click_trans_id: click_trans_id,
      merchant_trans_id: merchant_trans_id,
      merchant_prepare_id: merchant_prepare_id,
      error: 0,
      error_note: "Success"
    });

  } catch (error) {
    logger.error('Click Prepare Error:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      ip: req.ip
    });

    logTransaction('CLICK_PREPARE_ERROR', {
      click_trans_id: req.body.click_trans_id,
      merchant_trans_id: req.body.merchant_trans_id,
      error: 'System error'
    }, 'error');

    res.json({
      click_trans_id: req.body.click_trans_id || null,
      merchant_trans_id: req.body.merchant_trans_id || null,
      merchant_prepare_id: null,
      error: -9,
      error_note: "System error"
    });
  }
});

// Click Complete endpoint - confirms payment completion
router.post('/click/complete', async (req, res) => {
  try {
    const {
      click_trans_id,
      service_id,
      click_paydoc_id,
      merchant_trans_id,
      merchant_prepare_id,
      amount,
      action,
      sign_time,
      sign_string
    } = req.body;

    // Log incoming complete request
    logTransaction('CLICK_COMPLETE_REQUEST', {
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id,
      amount,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });

    // Click Complete Request received

    // Validate request origin - enabled in production
    if (process.env.NODE_ENV === 'production' && !validateClickOrigin(req)) {
      logTransaction('CLICK_COMPLETE_ERROR', {
        click_trans_id,
        merchant_trans_id,
        error: 'Invalid request origin',
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      }, 'error');
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_confirm_id: null,
        error: -9,
        error_note: "Invalid request origin"
      });
    }

    // Validate required fields
    if (!click_trans_id || !service_id || !click_paydoc_id || !merchant_trans_id || !merchant_prepare_id || !amount || action === undefined || !sign_time || !sign_string) {
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_confirm_id: null,
        error: -8,
        error_note: "Required parameter missing"
      });
    }

    // Validate action value (must be 1 for complete)
    if (parseInt(action) !== 1) {
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_confirm_id: null,
        error: -3,
        error_note: "Invalid action for complete"
      });
    }

    // Validate signature
    if (!validateClickSignature(req.body, sign_string, false)) {
      logTransaction('CLICK_COMPLETE_ERROR', {
        click_trans_id,
        merchant_trans_id,
        error: 'Invalid signature'
      }, 'error');
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_confirm_id: null,
        error: -1,
        error_note: "Invalid signature"
      });
    }

    // Find registration
    const registration = await Registration.findById(merchant_trans_id);
    if (!registration) {
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_confirm_id: null,
        error: -5,
        error_note: "Order not found"
      });
    }

    // Validate merchant_prepare_id matches
    if (registration.paymentInfo?.merchantPrepareId !== merchant_prepare_id) {
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_confirm_id: null,
        error: -6,
        error_note: "Transaction not found"
      });
    }

    // Check if payment has expired
    if (registration.paymentInfo?.expiresAt && new Date() > registration.paymentInfo.expiresAt) {
      logTransaction('CLICK_COMPLETE_ERROR', {
        click_trans_id,
        merchant_trans_id,
        error: 'Payment expired'
      }, 'error');
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_confirm_id: null,
        error: -6,
        error_note: "Payment session expired"
      });
    }

    // Check if already completed
    if (registration.paymentStatus === 'completed') {
      return res.json({
        click_trans_id: click_trans_id,
        merchant_trans_id: merchant_trans_id,
        merchant_confirm_id: registration.paymentInfo?.merchantConfirmId || null,
        error: -4,
        error_note: "Already confirmed"
      });
    }

    // Create merchant_confirm_id
    const merchant_confirm_id = `conf_${Date.now()}_${registration._id}`;

    // Complete the payment
    registration.paymentInfo.merchantConfirmId = merchant_confirm_id;
    registration.paymentInfo.completedAt = new Date();
    registration.paymentStatus = 'completed';
    registration.status = 'paid';
    await registration.save();

    // Log successful completion
    logTransaction('CLICK_COMPLETE_SUCCESS', {
      click_trans_id,
      merchant_trans_id,
      merchant_confirm_id,
      registration_id: registration._id,
      amount
    }, 'success');

    // Successful complete response
    res.json({
      click_trans_id: click_trans_id,
      merchant_trans_id: merchant_trans_id,
      merchant_confirm_id: merchant_confirm_id,
      error: 0,
      error_note: "Success"
    });

  } catch (error) {
    logger.error('Click Complete Error:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      ip: req.ip
    });

    logTransaction('CLICK_COMPLETE_ERROR', {
      click_trans_id: req.body.click_trans_id,
      merchant_trans_id: req.body.merchant_trans_id,
      error: 'System error'
    }, 'error');

    res.json({
      click_trans_id: req.body.click_trans_id || null,
      merchant_trans_id: req.body.merchant_trans_id || null,
      merchant_confirm_id: null,
      error: -9,
      error_note: "System error"
    });
  }
});

// Create payment URL endpoint for frontend
router.post('/click/create-payment', validatePayment, async (req, res) => {
  try {
    const { registrationId, amount } = req.body;

    // Find registration by ID
    const registration = await Registration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Use amount from request or fallback to default
    const paymentAmount = amount || APP_CONFIG.TEST_AMOUNT;
    const transactionParam = `ielts_${registration._id}`;

    const paymentData = {
      // Click Button Payment - redirects to Click portal (as per Click docs)
      clickButton: {
        url: `https://my.click.uz/services/pay?service_id=${CLICK_CONFIG.SERVICE_ID}&merchant_id=${CLICK_CONFIG.MERCHANT_ID}&amount=${paymentAmount}&transaction_param=${transactionParam}&merchant_user_id=${CLICK_CONFIG.MERCHANT_USER_ID}`,
        type: 'redirect'
      },

      // Pay by Card Payment - JavaScript integration for cards (as per Click docs)
      payByCard: {
        type: 'javascript',
        config: {
          merchant_id: CLICK_CONFIG.MERCHANT_ID,
          service_id: CLICK_CONFIG.SERVICE_ID,
          transaction_param: transactionParam,
          amount: paymentAmount,
          merchant_user_id: CLICK_CONFIG.MERCHANT_USER_ID
        }
      }
    };

    res.json({
      success: true,
      data: {
        paymentData,
        amount: paymentAmount,
        registration: {
          id: registration._id,
          student: `${registration.user.firstName} ${registration.user.lastName}`,
          phone: registration.user.phone
        }
      }
    });

  } catch (error) {
    console.error('Create payment URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment URL',
      error: error.message
    });
  }
});

// Check payment status endpoint
router.get('/status/:registrationId', async (req, res) => {
  try {
    const { registrationId } = req.params;

    // Find registration by ID
    const registration = await Registration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      data: {
        paymentStatus: registration.paymentStatus || 'pending',
        paymentInfo: registration.paymentInfo || null,
        registrationStatus: registration.status
      }
    });

  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
});

// Update payment status endpoint
router.post('/update-status', async (req, res) => {
  try {
    const { registrationId, paymentStatus, paidAt } = req.body;

    // Updating payment status

    // Find registration by ID
    const registration = await Registration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Update payment status in database
    registration.paymentStatus = paymentStatus;
    registration.status = paymentStatus === 'completed' ? 'paid' : registration.status;

    if (paidAt && paymentStatus === 'completed') {
      if (!registration.paymentInfo) {
        registration.paymentInfo = {};
      }
      registration.paymentInfo.completedAt = new Date(paidAt);
    }

    registration.updatedAt = new Date();
    await registration.save();

    // Payment status updated successfully

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: {
        registrationId: registration._id,
        status: registration.status,
        paymentStatus: registration.paymentStatus,
        updatedAt: registration.updatedAt
      }
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
});

export default router;