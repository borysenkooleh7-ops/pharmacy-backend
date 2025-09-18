const express = require('express')
const { getAllPharmacies, getPharmacyById, getPharmaciesByCity, getNearbyPharmacies, createPharmacy, updatePharmacy, deletePharmacy } = require('../controllers/pharmacyController')
const { adminAuthMiddleware } = require('../middleware/adminAuth')
const { validatePagination, validateSearchParams, validateCoordinateParams } = require('../middleware/validation')

const router = express.Router()

// Public routes
router.get('/', validatePagination, validateSearchParams, getAllPharmacies)
router.get('/:id', getPharmacyById)
router.get('/city/:cityId', getPharmaciesByCity)
router.get('/nearby/:lat/:lng', validateCoordinateParams, getNearbyPharmacies)

// Admin only routes
router.post('/', adminAuthMiddleware, createPharmacy)
router.put('/:id', adminAuthMiddleware, updatePharmacy)
router.delete('/:id', adminAuthMiddleware, deletePharmacy)

module.exports = router