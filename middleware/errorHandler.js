const { createErrorResponse } = require('../utils/responseHelper')

/**
 * Global error handling middleware
 * Should be the last middleware in the stack
 */
function errorHandler(err, req, res, next) {
  console.error('❌ Global error handler:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  })

  // Default error
  let status = 500
  let message = 'Internal server error'
  let details = null

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400
    message = 'Validation error'
    details = err.message
  } else if (err.name === 'CastError') {
    status = 400
    message = 'Invalid ID format'
    details = err.message
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413
    message = 'File too large'
    details = err.message
  } else if (err.code === '23505') { // PostgreSQL unique violation
    status = 409
    message = 'Duplicate entry'
    details = 'Resource already exists'
  } else if (err.code === '23503') { // PostgreSQL foreign key violation
    status = 400
    message = 'Invalid reference'
    details = 'Referenced resource does not exist'
  } else if (err.code === '23502') { // PostgreSQL not null violation
    status = 400
    message = 'Missing required field'
    details = err.message
  } else if (err.status || err.statusCode) {
    status = err.status || err.statusCode
    message = err.message || message
  }

  // Don't send stack trace in production
  if (process.env.NODE_ENV === 'production') {
    details = status === 500 ? 'An unexpected error occurred' : details
  } else {
    details = details || err.stack
  }

  res.status(status).json(createErrorResponse(message, details, err.code))
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
  const error = createErrorResponse(
    'Resource not found',
    `Cannot ${req.method} ${req.originalUrl}`
  )
  res.status(404).json(error)
}

/**
 * Async wrapper for route handlers
 * Catches async errors and passes them to error middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
}