const { adminAuth, optionalAdminAuth } = require('./auth')
const {
  validatePagination,
  validateSubmission,
  validateCoordinateParams,
  validateSearchParams,
  validateRateLimit
} = require('./validation')
const { errorHandler, notFoundHandler, asyncHandler } = require('./errorHandler')
const { requestLogger, securityHeaders, corsHeaders } = require('./logger')

module.exports = {
  // Authentication
  adminAuth,
  optionalAdminAuth,

  // Validation
  validatePagination,
  validateSubmission,
  validateCoordinateParams,
  validateSearchParams,
  validateRateLimit,

  // Error handling
  errorHandler,
  notFoundHandler,
  asyncHandler,

  // Logging and security
  requestLogger,
  securityHeaders,
  corsHeaders
}