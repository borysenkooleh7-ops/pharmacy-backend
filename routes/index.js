const express = require('express')
const cityRoutes = require('./cityRoutes')
const pharmacyRoutes = require('./pharmacyRoutes')
const medicineRoutes = require('./medicineRoutes')
const submissionRoutes = require('./submissionRoutes')
const adRoutes = require('./adRoutes')
const onlineDataRoutes = require('./onlineDataRoutes')

const router = express.Router()

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime()
    }
  })
})

// API routes
router.use('/cities', cityRoutes)
router.use('/pharmacies', pharmacyRoutes)
router.use('/medicines', medicineRoutes)
router.use('/pharmacy-submissions', submissionRoutes)
router.use('/ads', adRoutes)
router.use('/online-data', onlineDataRoutes)

// API documentation route
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Apoteka24.me API Documentation',
    data: {
      version: '1.0.0',
      endpoints: {
        cities: {
          'GET /api/cities': 'Get all cities',
          'GET /api/cities/:id': 'Get city by ID',
          'GET /api/cities/slug/:slug': 'Get city by slug',
          'POST /api/cities': 'Create new city (admin)',
          'PUT /api/cities/:id': 'Update city (admin)',
          'DELETE /api/cities/:id': 'Delete city (admin)'
        },
        pharmacies: {
          'GET /api/pharmacies': 'Get pharmacies with filters',
          'GET /api/pharmacies/:id': 'Get pharmacy by ID',
          'GET /api/pharmacies/city/:cityId': 'Get pharmacies by city',
          'GET /api/pharmacies/nearby/:lat/:lng': 'Get nearby pharmacies',
          'POST /api/pharmacies': 'Create pharmacy (admin)',
          'PUT /api/pharmacies/:id': 'Update pharmacy (admin)',
          'DELETE /api/pharmacies/:id': 'Delete pharmacy (admin)'
        },
        medicines: {
          'GET /api/medicines': 'Get medicines with optional search',
          'GET /api/medicines/:id': 'Get medicine by ID with pharmacies',
          'GET /api/medicines/search/:name': 'Search medicines by name',
          'POST /api/medicines': 'Create medicine (admin)',
          'PUT /api/medicines/:id': 'Update medicine (admin)',
          'DELETE /api/medicines/:id': 'Delete medicine (admin)'
        },
        submissions: {
          'POST /api/pharmacy-submissions': 'Submit pharmacy suggestion',
          'GET /api/pharmacy-submissions': 'Get all submissions (admin)',
          'GET /api/pharmacy-submissions/:id': 'Get submission by ID (admin)',
          'PUT /api/pharmacy-submissions/:id': 'Update submission status (admin)',
          'DELETE /api/pharmacy-submissions/:id': 'Delete submission (admin)'
        },
        ads: {
          'GET /api/ads': 'Get active ads',
          'GET /api/ads/all': 'Get all ads (admin)',
          'POST /api/ads': 'Create ad (admin)',
          'PUT /api/ads/:id': 'Update ad (admin)',
          'DELETE /api/ads/:id': 'Delete ad (admin)'
        },
        onlineData: {
          'POST /api/online-data/sync-city': 'Sync pharmacy data for a specific city (admin)',
          'GET /api/online-data/cities': 'Get all cities available for syncing (admin)',
          'GET /api/online-data/status': 'Get sync status and statistics (admin)'
        }
      },
      queryParameters: {
        pharmacies: {
          cityId: 'Filter by city ID',
          is24h: 'Filter 24/7 pharmacies (true/false)',
          openSunday: 'Filter Sunday open pharmacies (true/false)',
          search: 'Search in name and address',
          lat: 'Latitude for nearby search',
          lng: 'Longitude for nearby search',
          radius: 'Search radius in km (default: 10)',
          page: 'Page number (default: 1)',
          limit: 'Items per page (default: 20, max: 100)'
        }
      },
      authentication: {
        admin: 'Send x-admin-key header with admin key'
      }
    }
  })
})

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    meta: {
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  })
})

module.exports = router