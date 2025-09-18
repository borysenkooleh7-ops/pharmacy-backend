const express = require('express')
const { getAllAds, getActiveAds, getAdById, createAd, updateAd, deleteAd } = require('../controllers/adController')
const { adminAuthMiddleware } = require('../middleware/adminAuth')

const router = express.Router()

// Public routes
router.get('/', getActiveAds)

// Admin only routes
router.get('/all', adminAuthMiddleware, getAllAds)
router.get('/:id', adminAuthMiddleware, getAdById)
router.post('/', adminAuthMiddleware, createAd)
router.put('/:id', adminAuthMiddleware, updateAd)
router.delete('/:id', adminAuthMiddleware, deleteAd)

module.exports = router