const config = require('../config')
const { createErrorResponse } = require('../utils/responseHelper')

/**
 * Admin authentication middleware
 * Checks for x-admin-key header and validates against configured admin key
 */
function adminAuth(req, res, next) {
  try {
    const adminKey = req.headers['x-admin-key']

    if (!adminKey) {
      return res.status(401).json(createErrorResponse(
        'Admin authentication required',
        'Missing x-admin-key header'
      ))
    }

    if (adminKey !== config.adminKey) {
      return res.status(403).json(createErrorResponse(
        'Invalid admin credentials',
        'Invalid admin key provided'
      ))
    }

    // Add admin flag to request object
    req.isAdmin = true
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json(createErrorResponse('Authentication error', error.message))
  }
}

/**
 * Optional admin authentication middleware
 * Sets admin flag if valid admin key is provided, but doesn't reject if missing
 */
function optionalAdminAuth(req, res, next) {
  try {
    const adminKey = req.headers['x-admin-key']

    if (adminKey && adminKey === config.adminKey) {
      req.isAdmin = true
    } else {
      req.isAdmin = false
    }

    next()
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    req.isAdmin = false
    next()
  }
}

module.exports = {
  adminAuth,
  optionalAdminAuth
}