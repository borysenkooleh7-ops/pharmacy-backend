/**
 * Create a standardized success response
 * @param {*} data - The response data
 * @param {string} message - Success message
 * @param {object} meta - Additional metadata
 * @returns {object} Standardized response object
 */
function createResponse(data, message = 'Success', meta = {}) {
  return {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  }
}

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {string} details - Error details
 * @param {number} code - Error code
 * @returns {object} Standardized error response object
 */
function createErrorResponse(message = 'An error occurred', details = null, code = null) {
  const response = {
    success: false,
    message,
    meta: {
      timestamp: new Date().toISOString()
    }
  }

  if (details) {
    response.details = details
  }

  if (code) {
    response.code = code
  }

  return response
}

/**
 * Create a paginated response
 * @param {Array} data - The paginated data
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {string} message - Success message
 * @returns {object} Paginated response object
 */
function createPaginatedResponse(data, total, page, limit, message = 'Data retrieved successfully') {
  const totalPages = Math.ceil(total / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    }
  }
}

/**
 * Validate required fields in request body
 * @param {object} body - Request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Array} Array of missing fields
 */
function validateRequiredFields(body, requiredFields) {
  return requiredFields.filter(field => {
    return !body.hasOwnProperty(field) ||
           body[field] === null ||
           body[field] === undefined ||
           (typeof body[field] === 'string' && body[field].trim() === '')
  })
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if valid coordinates
 */
function validateCoordinates(lat, lng) {
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)

  return !isNaN(latitude) &&
         !isNaN(longitude) &&
         latitude >= -90 &&
         latitude <= 90 &&
         longitude >= -180 &&
         longitude <= 180
}

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str
  return str.trim().replace(/[<>]/g, '')
}

/**
 * Convert string to slug
 * @param {string} str - String to convert
 * @returns {string} Slug string
 */
function createSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

module.exports = {
  createResponse,
  createErrorResponse,
  createPaginatedResponse,
  validateRequiredFields,
  validateEmail,
  validateCoordinates,
  sanitizeString,
  createSlug
}