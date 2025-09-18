const config = require('../config')

// Simple admin authentication middleware
const adminAuthMiddleware = (req, res, next) => {
  const adminKey = req.headers['x-admin-key']

  if (!adminKey || adminKey !== config.admin.key) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid admin key',
      meta: { timestamp: new Date().toISOString() }
    })
  }

  next()
}

module.exports = {
  adminAuthMiddleware
}