const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
// Prevent NoSQL query injection by stripping keys starting with $
const mongoSanitize = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$')) {
          delete obj[key];
        } else {
          sanitizeObject(obj[key]);
        }
      }
    }
  };
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  next();
};
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const thumbnailRoutes = require('./routes/thumbnails');
const analyticsRoutes = require('./routes/analytics');

const errorHandler = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');

const app = express();

// Set HTTP security headers
app.use(helmet());

// Configure CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Compress HTTP responses
app.use(compression());

// Prevent NoSQL query injection
app.use(mongoSanitize);

// Logger for request audits
app.use(morgan('dev'));

// Parse incoming JSON requests with body limit
app.use(express.json({ limit: '5mb' }));

// Apply rate limiting to all requests
app.use('/api', apiLimiter);

// Register routes
app.use('/api', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/thumbnails', thumbnailRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Handle unknown route 404s
app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
