require('dotenv').config()

const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Admin configuration
  admin: {
    key: process.env.ADMIN_KEY || 'admin123'
  },

  cors: {
    origin: [process.env.CORS_ORIGIN || 'https://radiant-pothos-da792d.netlify.app/'],
    credentials: true,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // API configuration
  api: {
    prefix: '/api',
    version: 'v1',
  },

  // Pagination defaults
  pagination: {
    defaultLimit: parseInt(process.env.N_PHARMACIES) || 20,
    maxLimit: 100,
  },

  // Search configuration
  search: {
    radius: parseInt(process.env.SEARCH_RADIUS) || 2000,
    nPharmacies: parseInt(process.env.N_PHARMACIES) || 20,
  },
}

module.exports = config