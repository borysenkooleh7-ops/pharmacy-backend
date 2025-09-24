const { Ad } = require('../db/models')
const { createResponse, createErrorResponse, createPaginatedResponse } = require('../utils/responseHelper')
const config = require('../config')

const getAllAds = async (req, res) => {
  try {
    const {
      page = 1,
      limit = config.pagination.defaultLimit
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)
    const actualLimit = Math.min(parseInt(limit), config.pagination.maxLimit)

    const { count, rows: ads } = await Ad.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit: actualLimit,
      offset: offset
    })

    const paginatedResponse = createPaginatedResponse(
      ads,
      count,
      parseInt(page),
      actualLimit,
      'Ads retrieved successfully'
    )

    res.json(paginatedResponse)
  } catch (error) {
    console.error('Error fetching ads:', error)
    res.status(500).json(createErrorResponse('Failed to fetch ads', error.message))
  }
}

const getActiveAds = async (req, res) => {
  try {
    // Get language from header or default to 'me'
    const language = req.headers['x-language'] || 'me'

    const ads = await Ad.findActiveAds(language)
    res.json(createResponse(ads, 'Active ads retrieved successfully'))
  } catch (error) {
    console.error('Error fetching active ads:', error)
    res.status(500).json(createErrorResponse('Failed to fetch active ads', error.message))
  }
}

const getAdById = async (req, res) => {
  try {
    const { id } = req.params
    const ad = await Ad.findByPk(id)

    if (!ad) {
      return res.status(404).json(createErrorResponse('Ad not found'))
    }

    res.json(createResponse(ad, 'Ad retrieved successfully'))
  } catch (error) {
    console.error('Error fetching ad:', error)
    res.status(500).json(createErrorResponse('Failed to fetch ad', error.message))
  }
}

const createAd = async (req, res) => {
  try {
    const adData = req.body

    // Validate required fields for bilingual schema
    const requiredFields = ['name_me', 'image_url', 'target_url']
    const missingFields = requiredFields.filter(field => !adData[field])

    if (missingFields.length > 0) {
      return res.status(400).json(createErrorResponse(
        `Missing required fields: ${missingFields.join(', ')}`
      ))
    }

    // Validate name lengths (match database constraints)
    if (adData.name_me && adData.name_me.length > 200) {
      return res.status(400).json(createErrorResponse('Montenegrin name must be 200 characters or less'))
    }
    if (adData.name_en && adData.name_en.length > 200) {
      return res.status(400).json(createErrorResponse('English name must be 200 characters or less'))
    }

    // Validate URLs
    try {
      new URL(adData.image_url)
      new URL(adData.target_url)
    } catch (urlError) {
      return res.status(400).json(createErrorResponse('Invalid URL format'))
    }

    // Validate weight if provided
    if (adData.weight !== undefined) {
      const weight = parseInt(adData.weight)
      if (isNaN(weight) || weight < 0) {
        return res.status(400).json(createErrorResponse('Weight must be a non-negative number'))
      }
      adData.weight = weight
    }

    const ad = await Ad.create(adData)
    res.status(201).json(createResponse(ad, 'Ad created successfully'))
  } catch (error) {
    console.error('Error creating ad:', error)
    res.status(500).json(createErrorResponse('Failed to create ad', error.message))
  }
}

const updateAd = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const existingAd = await Ad.findByPk(id)
    if (!existingAd) {
      return res.status(404).json(createErrorResponse('Ad not found'))
    }

    // Validate name lengths if provided (match database constraints)
    if (updateData.name_me && updateData.name_me.length > 200) {
      return res.status(400).json(createErrorResponse('Montenegrin name must be 200 characters or less'))
    }
    if (updateData.name_en && updateData.name_en.length > 200) {
      return res.status(400).json(createErrorResponse('English name must be 200 characters or less'))
    }

    // Validate URLs if provided
    if (updateData.image_url || updateData.target_url) {
      try {
        if (updateData.image_url) new URL(updateData.image_url)
        if (updateData.target_url) new URL(updateData.target_url)
      } catch (urlError) {
        return res.status(400).json(createErrorResponse('Invalid URL format'))
      }
    }

    // Validate weight if provided
    if (updateData.weight !== undefined) {
      const weight = parseInt(updateData.weight)
      if (isNaN(weight) || weight < 0) {
        return res.status(400).json(createErrorResponse('Weight must be a non-negative number'))
      }
      updateData.weight = weight
    }

    const updatedAd = await existingAd.update(updateData)
    res.json(createResponse(updatedAd, 'Ad updated successfully'))
  } catch (error) {
    console.error('Error updating ad:', error)
    res.status(500).json(createErrorResponse('Failed to update ad', error.message))
  }
}

const deleteAd = async (req, res) => {
  try {
    const { id } = req.params

    const existingAd = await Ad.findByPk(id)
    if (!existingAd) {
      return res.status(404).json(createErrorResponse('Ad not found'))
    }

    await existingAd.destroy()
    res.json(createResponse(null, 'Ad deleted successfully'))
  } catch (error) {
    console.error('Error deleting ad:', error)
    res.status(500).json(createErrorResponse('Failed to delete ad', error.message))
  }
}

module.exports = {
  getAllAds,
  getActiveAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd
}