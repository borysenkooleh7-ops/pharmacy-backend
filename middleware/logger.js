/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now()

  // Log request
  console.log(`📥 ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  })

  // Override res.end to log response
  const originalEnd = res.end
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start
    const contentLength = res.get('Content-Length') || (chunk ? chunk.length : 0)

    console.log(`📤 ${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: `${contentLength}b`,
      timestamp: new Date().toISOString()
    })

    originalEnd.call(this, chunk, encoding)
  }

  next()
}

/**
 * Security headers middleware
 */
function securityHeaders(req, res, next) {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Remove server information
  res.removeHeader('X-Powered-By')

  next()
}

/**
 * CORS headers middleware (if not using cors package)
 */
function corsHeaders(req, res, next) {
  const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*']

  const origin = req.headers.origin
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-key')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }

  next()
}

module.exports = {
  requestLogger,
  securityHeaders,
  corsHeaders
}