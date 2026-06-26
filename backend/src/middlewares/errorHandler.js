/**
 * Centralized global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Set default status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = undefined;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map(e => e.message);
  }

  // Handle MongoDB duplicate key errors (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists.`;
  }

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size too large. Maximum limit is 10MB.';
  }

  // Format standard API response
  res.status(statusCode).json({
    success: false,
    error: message,
    details,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
