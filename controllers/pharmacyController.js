const { Pharmacy } = require('../db/models')
const { createResponse, createErrorResponse, createPaginatedResponse } = require('../utils/responseHelper')
const config = require('../config')

const getAllPharmacies = async (req, res) => {
  try {
    const {
      cityId,
      is24h,
      openSunday,
      search,
      page = 1,
      limit = config.pagination.defaultLimit
    } = req.query

    // Remove nearby search from general endpoint - use dedicated /nearby endpoint instead

    // Check if this is an admin request (has x-admin-key header)
    const isAdminRequest = !!req.headers['x-admin-key']

    // Handle regular filtered search
    const filters = {
      cityId: cityId ? parseInt(cityId) : null,
      is24h,
      openSunday,
      search,
      // For admin requests, sort by most recent (updated_at DESC)
      sortBy: isAdminRequest ? 'recent' : null,
      limit: Math.min(parseInt(limit), config.pagination.maxLimit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    }

    const result = await Pharmacy.findWithFilters(filters)
    const pharmacies = result.rows || []
    const total = result.count || 0

    const paginatedResponse = createPaginatedResponse(
      pharmacies,
      total,
      parseInt(page),
      parseInt(limit),
      'Pharmacies retrieved successfully'
    )

    res.json(paginatedResponse)
  } catch (error) {
    console.error('Error fetching pharmacies:', error)
    res.status(500).json(createErrorResponse('Failed to fetch pharmacies', error.message))
  }
}

const getPharmacyById = async (req, res) => {
  try {
    const { id } = req.params
    const pharmacy = await Pharmacy.findByPk(id, {
      include: [{
        model: require('../db/models').City,
        as: 'city'
      }]
    })

    if (!pharmacy) {
      return res.status(404).json(createErrorResponse('Pharmacy not found'))
    }

    res.json(createResponse(pharmacy, 'Pharmacy retrieved successfully'))
  } catch (error) {
    console.error('Error fetching pharmacy:', error)
    res.status(500).json(createErrorResponse('Failed to fetch pharmacy', error.message))
  }
}

const getPharmaciesByCity = async (req, res) => {
  try {
    const { cityId } = req.params
    const pharmacies = await Pharmacy.findByCity(parseInt(cityId))

    res.json(createResponse(pharmacies, 'City pharmacies retrieved successfully'))
  } catch (error) {
    console.error('Error fetching city pharmacies:', error)
    res.status(500).json(createErrorResponse('Failed to fetch city pharmacies', error.message))
  }
}

const createPharmacy = async (req, res) => {
  try {
    const pharmacyData = req.body

    // Validate required fields
    const requiredFields = ['city_id', 'name_me', 'address', 'lat', 'lng', 'hours_monfri', 'hours_sat', 'hours_sun']
    const missingFields = requiredFields.filter(field => !pharmacyData[field])

    if (missingFields.length > 0) {
      return res.status(400).json(createErrorResponse(
        `Missing required fields: ${missingFields.join(', ')}`
      ))
    }

    // Validate coordinates
    const lat = parseFloat(pharmacyData.lat)
    const lng = parseFloat(pharmacyData.lng)

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json(createErrorResponse('Invalid coordinates'))
    }

    const pharmacy = await Pharmacy.create({
      ...pharmacyData,
      lat,
      lng
    })

    res.status(201).json(createResponse(pharmacy, 'Pharmacy created successfully'))
  } catch (error) {
    console.error('Error creating pharmacy:', error)
    res.status(500).json(createErrorResponse('Failed to create pharmacy', error.message))
  }
}

const updatePharmacy = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const existingPharmacy = await Pharmacy.findByPk(id)
    if (!existingPharmacy) {
      return res.status(404).json(createErrorResponse('Pharmacy not found'))
    }

    // Validate coordinates if provided
    if (updateData.lat !== undefined || updateData.lng !== undefined) {
      const lat = updateData.lat !== undefined ? parseFloat(updateData.lat) : parseFloat(existingPharmacy.lat)
      const lng = updateData.lng !== undefined ? parseFloat(updateData.lng) : parseFloat(existingPharmacy.lng)

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json(createErrorResponse('Invalid coordinates'))
      }

      updateData.lat = lat
      updateData.lng = lng
    }

    const updatedPharmacy = await existingPharmacy.update(updateData)
    res.json(createResponse(updatedPharmacy, 'Pharmacy updated successfully'))
  } catch (error) {
    console.error('Error updating pharmacy:', error)
    res.status(500).json(createErrorResponse('Failed to update pharmacy', error.message))
  }
}

const deletePharmacy = async (req, res) => {
  try {
    const { id } = req.params

    const existingPharmacy = await Pharmacy.findByPk(id)
    if (!existingPharmacy) {
      return res.status(404).json(createErrorResponse('Pharmacy not found'))
    }

    await existingPharmacy.destroy()
    res.json(createResponse(null, 'Pharmacy deleted successfully'))
  } catch (error) {
    console.error('Error deleting pharmacy:', error)
    res.status(500).json(createErrorResponse('Failed to delete pharmacy', error.message))
  }
}

const getNearbyPharmacies = async (req, res) => {
  try {
    // Coordinates are already validated by validateCoordinateParams middleware
    const { lat, lng } = req.coordinates
    const { radius = 10, limit = config.pagination.defaultLimit } = req.query

    const pharmacies = await Pharmacy.findNearby(
      lat,
      lng,
      parseFloat(radius),
      Math.min(parseInt(limit), config.pagination.maxLimit)
    )

    res.json(createResponse(pharmacies, 'Nearby pharmacies retrieved successfully'))
  } catch (error) {
    console.error('Error fetching nearby pharmacies:', error)
    res.status(500).json(createErrorResponse('Failed to fetch nearby pharmacies', error.message))
  }
}

module.exports = {
  getAllPharmacies,
  getPharmacyById,
  getPharmaciesByCity,
  createPharmacy,
  updatePharmacy,
  deletePharmacy,
  getNearbyPharmacies
}