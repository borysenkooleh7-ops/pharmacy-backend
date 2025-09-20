const { PharmacySubmission, Pharmacy, City } = require('../db/models')
const { createResponse, createErrorResponse, createPaginatedResponse } = require('../utils/responseHelper')
const config = require('../config')

const createSubmission = async (req, res) => {
  try {
    const submissionData = req.body

    // Get city_id from city_slug if provided
    if (submissionData.city_slug) {
      const city = await City.findBySlug(submissionData.city_slug)
      if (city) {
        submissionData.city_id = city.id
      }
    }

    // Convert coordinates to numbers if provided
    if (submissionData.lat) {
      submissionData.lat = parseFloat(submissionData.lat)
    }
    if (submissionData.lng) {
      submissionData.lng = parseFloat(submissionData.lng)
    }

    const submission = await PharmacySubmission.create(submissionData)
    res.status(201).json(createResponse(submission, 'Pharmacy submission created successfully'))
  } catch (error) {
    console.error('Error creating submission:', error)
    res.status(500).json(createErrorResponse('Failed to create submission', error.message))
  }
}

const getAllSubmissions = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = config.pagination.defaultLimit
    } = req.query

    const filters = {
      status,
      limit: Math.min(parseInt(limit), config.pagination.maxLimit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    }

    let whereClause = {}
    if (status) {
      whereClause.status = status
    }

    const { count: total, rows: submissions } = await PharmacySubmission.findAndCountAll({
      where: whereClause,
      limit: filters.limit,
      offset: filters.offset,
      order: [['created_at', 'DESC']]
    })

    const paginatedResponse = createPaginatedResponse(
      submissions,
      total,
      parseInt(page),
      parseInt(limit),
      'Submissions retrieved successfully'
    )

    res.json(paginatedResponse)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    res.status(500).json(createErrorResponse('Failed to fetch submissions', error.message))
  }
}

const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params
    const submission = await PharmacySubmission.findByPk(id)

    if (!submission) {
      return res.status(404).json(createErrorResponse('Submission not found'))
    }

    res.json(createResponse(submission, 'Submission retrieved successfully'))
  } catch (error) {
    console.error('Error fetching submission:', error)
    res.status(500).json(createErrorResponse('Failed to fetch submission', error.message))
  }
}

const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, review_notes, pharmacy_data } = req.body

    const existingSubmission = await PharmacySubmission.findByPk(id)
    if (!existingSubmission) {
      return res.status(404).json(createErrorResponse('Submission not found'))
    }

    // If approving, create pharmacy record
    if (status === 'approved' && pharmacy_data) {
      try {
        // Get city ID from slug
        const submissionCity = await City.findBySlug(existingSubmission.city_slug)

        // Create pharmacy from submission data and provided pharmacy_data
        const pharmacyToCreate = {
          city_id: existingSubmission.city_id || submissionCity?.id,
          name_me: existingSubmission.name_me,
          name_en: existingSubmission.name_en || pharmacy_data?.name_en,
          address: existingSubmission.address,
          lat: existingSubmission.lat,
          lng: existingSubmission.lng,
          is_24h: existingSubmission.is_24h || false,
          open_sunday: existingSubmission.open_sunday || false,
          hours_monfri: existingSubmission.hours_monfri,
          hours_sat: existingSubmission.hours_sat,
          hours_sun: existingSubmission.hours_sun,
          phone: existingSubmission.phone,
          website: existingSubmission.website,
          active: true
        }

        await Pharmacy.create(pharmacyToCreate)
      } catch (pharmacyError) {
        console.error('Error creating pharmacy from submission:', pharmacyError)
        return res.status(500).json(createErrorResponse(
          'Failed to create pharmacy from submission',
          pharmacyError.message
        ))
      }
    }

    const updatedSubmission = await existingSubmission.update({
      status,
      review_notes
    })
    res.json(createResponse(updatedSubmission, 'Submission status updated successfully'))
  } catch (error) {
    console.error('Error updating submission status:', error)
    res.status(500).json(createErrorResponse('Failed to update submission status', error.message))
  }
}

const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params

    const existingSubmission = await PharmacySubmission.findByPk(id)
    if (!existingSubmission) {
      return res.status(404).json(createErrorResponse('Submission not found'))
    }

    await existingSubmission.destroy()
    res.json(createResponse(null, 'Submission deleted successfully'))
  } catch (error) {
    console.error('Error deleting submission:', error)
    res.status(500).json(createErrorResponse('Failed to delete submission', error.message))
  }
}

const getSubmissionsByStatus = async (req, res) => {
  try {
    const { status } = req.params
    const submissions = await PharmacySubmission.findByStatus(status)

    res.json(createResponse(submissions, `${status} submissions retrieved successfully`))
  } catch (error) {
    console.error('Error fetching submissions by status:', error)
    res.status(500).json(createErrorResponse('Failed to fetch submissions by status', error.message))
  }
}

module.exports = {
  createSubmission,
  getAllSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  deleteSubmission,
  getSubmissionsByStatus
}