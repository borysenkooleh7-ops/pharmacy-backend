const express = require('express')
const { createSubmission, getAllSubmissions, getSubmissionById, getSubmissionsByStatus, updateSubmissionStatus, deleteSubmission } = require('../controllers/submissionController')
const { adminAuthMiddleware } = require('../middleware/adminAuth')
const { validateSubmission, validatePagination } = require('../middleware/validation')

const router = express.Router()

// Public routes
router.post('/', validateSubmission, createSubmission)

// Admin only routes
router.get('/', adminAuthMiddleware, validatePagination, getAllSubmissions)
router.get('/:id', adminAuthMiddleware, getSubmissionById)
router.get('/status/:status', adminAuthMiddleware, getSubmissionsByStatus)
router.put('/:id', adminAuthMiddleware, updateSubmissionStatus)
router.delete('/:id', adminAuthMiddleware, deleteSubmission)

module.exports = router