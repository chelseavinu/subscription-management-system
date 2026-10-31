/**
 * Centralized API Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  console.error('[Error Details]:', err);

  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(val => val.message);
  }

  // Mongoose Bad ObjectId / Cast Error
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for field '${err.path}'`;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for '${field}'. Must be unique.`;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || (err.errors ? err.errors : undefined),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
