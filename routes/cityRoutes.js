const express = require('express')
const { getAllCities, getCityById, getCityBySlug, createCity, updateCity, deleteCity } = require('../controllers/cityController')
const { adminAuthMiddleware } = require('../middleware/adminAuth')

const router = express.Router()

// Public routes
router.get('/', getAllCities)
router.get('/:id', getCityById)
router.get('/slug/:slug', getCityBySlug)

// Admin only routes
router.post('/', adminAuthMiddleware, createCity)
router.put('/:id', adminAuthMiddleware, updateCity)
router.delete('/:id', adminAuthMiddleware, deleteCity)

module.exports = router