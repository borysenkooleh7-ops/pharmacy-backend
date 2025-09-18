const express = require('express')
const { getAllMedicines, getMedicineById, searchMedicines, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController')
const { adminAuthMiddleware } = require('../middleware/adminAuth')
const { validatePagination } = require('../middleware/validation')

const router = express.Router()

// Public routes
router.get('/', validatePagination, getAllMedicines)
router.get('/search/:name', validatePagination, searchMedicines)
router.get('/:id', getMedicineById)

// Admin only routes
router.post('/', adminAuthMiddleware, createMedicine)
router.put('/:id', adminAuthMiddleware, updateMedicine)
router.delete('/:id', adminAuthMiddleware, deleteMedicine)

module.exports = router