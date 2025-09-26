const express = require('express')
const router = express.Router()
const { adminAuth } = require('../middleware/auth')
const {
  syncCityPharmacyData,
  getSyncableCities,
  getSyncStatus
} = require('../controllers/onlineDataController')
const { syncAndListAllPharmacies } = require('../controllers/bootstrapPharmacies');

// All routes require admin authentication
router.use(adminAuth)

// router.post('/sync-city',adminAuth, syncAndListAllPharmacies);
// Sync pharmacy data for a specific city
router.post('/sync-city', syncCityPharmacyData)

// Get all cities available for syncing
router.get('/cities', getSyncableCities)

// Get sync status/statistics
router.get('/status', getSyncStatus)

module.exports = router