const { createErrorResponse, validateRequiredFields, validateEmail, validateCoordinates } = require('../utils/responseHelper')
const config = require('../config')

/**
 * Validate pagination parameters
 */
function validatePagination(req, res, next) {
  try {
    const { page, limit } = req.query

    if (page !== undefined) {
      const pageNum = parseInt(page)
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json(createErrorResponse('Invalid page number. Must be a positive integer.'))
      }
      req.query.page = pageNum
    }

    if (limit !== undefined) {
      const limitNum = parseInt(limit)
      if (isNaN(limitNum) || limitNum < 1) {
        return res.status(400).json(createErrorResponse('Invalid limit. Must be a positive integer.'))
      }
      if (limitNum > config.pagination.maxLimit) {
        return res.status(400).json(createErrorResponse(
          `Limit too large. Maximum allowed is ${config.pagination.maxLimit}.`
        ))
      }
      req.query.limit = limitNum
    }

    next()
  } catch (error) {
    console.error('Pagination validation error:', error)
    res.status(500).json(createErrorResponse('Validation error', error.message))
  }
}

/**
 * Validate pharmacy submission data
 */
function validateSubmission(req, res, next) {
  try {
    const { name_me, name_en, address, city_slug, email, phone, website, lat, lng, hours_monfri, hours_sat, hours_sun } = req.body

    // Check required fields (updated to match new schema)
    const requiredFields = ['name_me', 'address', 'city_slug', 'email', 'lat', 'lng', 'hours_monfri', 'hours_sat', 'hours_sun']
    const missingFields = validateRequiredFields(req.body, requiredFields)

    if (missingFields.length > 0) {
      return res.status(400).json(createErrorResponse(
        `Missing required fields: ${missingFields.join(', ')}`
      ))
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json(createErrorResponse('Invalid email format'))
    }

    // Validate coordinates (now required)
    if (!validateCoordinates(lat, lng)) {
      return res.status(400).json(createErrorResponse(
        'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
      ))
    }

    // Validate hours format
    const hourFields = [hours_monfri, hours_sat, hours_sun]
    const hourFieldNames = ['hours_monfri', 'hours_sat', 'hours_sun']

    for (let i = 0; i < hourFields.length; i++) {
      const hours = hourFields[i]
      const fieldName = hourFieldNames[i]

      if (!hours || hours.trim() === '') {
        return res.status(400).json(createErrorResponse(`${fieldName} is required`))
      }

      // Basic format validation - should be either "Closed" or time format
      const timeFormatRegex = /^(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}|Closed|closed|CLOSED)$/i
      if (!timeFormatRegex.test(hours.trim())) {
        return res.status(400).json(createErrorResponse(
          `Invalid ${fieldName} format. Use "HH:MM - HH:MM" or "Closed"`
        ))
      }
    }

    // Validate phone format if provided
    if (phone !== undefined && phone.trim() !== '') {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/
      if (!phoneRegex.test(phone)) {
        return res.status(400).json(createErrorResponse('Invalid phone number format'))
      }
    }

    // Validate website URL if provided
    if (website !== undefined && website.trim() !== '') {
      try {
        new URL(website)
      } catch (urlError) {
        return res.status(400).json(createErrorResponse('Invalid website URL format'))
      }
    }

    // Validate city slug format
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(city_slug)) {
      return res.status(400).json(createErrorResponse(
        'Invalid city slug format. Only lowercase letters, numbers, and hyphens allowed'
      ))
    }

    next()
  } catch (error) {
    console.error('Submission validation error:', error)
    res.status(500).json(createErrorResponse('Validation error', error.message))
  }
}

/**
 * Validate coordinates in URL parameters
 */
function validateCoordinateParams(req, res, next) {
  try {
    const { lat, lng } = req.params

    if (!validateCoordinates(lat, lng)) {
      return res.status(400).json(createErrorResponse(
        'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
      ))
    }

    // Convert to numbers and add to request
    req.coordinates = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    }

    next()
  } catch (error) {
    console.error('Coordinate validation error:', error)
    res.status(500).json(createErrorResponse('Validation error', error.message))
  }
}

/**
 * Validate and sanitize search parameters
 */
function validateSearchParams(req, res, next) {
  try {
    const { search, cityId, is24h, openSunday } = req.query

    // Validate search string length
    if (search !== undefined) {
      if (typeof search !== 'string') {
        return res.status(400).json(createErrorResponse('Search parameter must be a string'))
      }
      if (search.length > 100) {
        return res.status(400).json(createErrorResponse('Search string too long (max 100 characters)'))
      }
      // Sanitize search string
      req.query.search = search.trim()
    }

    // Validate cityId
    if (cityId !== undefined) {
      const cityIdNum = parseInt(cityId)
      if (isNaN(cityIdNum) || cityIdNum < 1) {
        return res.status(400).json(createErrorResponse('Invalid city ID. Must be a positive integer.'))
      }
      req.query.cityId = cityIdNum
    }

    // Validate boolean flags
    if (is24h !== undefined && !['true', 'false'].includes(is24h)) {
      return res.status(400).json(createErrorResponse('is24h parameter must be "true" or "false"'))
    }

    if (openSunday !== undefined && !['true', 'false'].includes(openSunday)) {
      return res.status(400).json(createErrorResponse('openSunday parameter must be "true" or "false"'))
    }

    next()
  } catch (error) {
    console.error('Search params validation error:', error)
    res.status(500).json(createErrorResponse('Validation error', error.message))
  }
}

/**
 * Rate limiting validation
 */
function validateRateLimit(req, res, next) {
  // This is a placeholder for rate limiting logic
  // In production, you might want to use express-rate-limit or similar
  next()
}

module.exports = {
  validatePagination,
  validateSubmission,
  validateCoordinateParams,
  validateSearchParams,
  validateRateLimit
}