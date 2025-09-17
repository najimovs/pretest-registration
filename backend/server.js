import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import connectDatabase from './config/database.js';
import registrationRoutes from './routes/registrations.js';
import paymentRoutes from './routes/payments.js';
import logger from './utils/logger.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDatabase();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use('/api/registrations/login', authLimiter);
app.use('/api/registrations/admin/login', authLimiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.ADMIN_PANEL_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize user input
app.use(mongoSanitize());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });
  next();
});

// Routes
app.use('/api/registrations', registrationRoutes);
console.log('Payment routes imported:', typeof paymentRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'IELTS Registration API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log the error
  logger.error('Application error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // Don't expose sensitive error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  let statusCode = err.statusCode || 500;
  let message = 'Internal server error';

  if (isDevelopment) {
    message = err.message;
  } else {
    // Only expose safe error messages in production
    if (statusCode === 400) message = 'Bad request';
    if (statusCode === 401) message = 'Unauthorized';
    if (statusCode === 403) message = 'Forbidden';
    if (statusCode === 404) message = 'Not found';
    if (statusCode === 429) message = 'Too many requests';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDevelopment && { error: err.message, stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV,
    healthCheck: `http://localhost:${PORT}/api/health`
  });
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});