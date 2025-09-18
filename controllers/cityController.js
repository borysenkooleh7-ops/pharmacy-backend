const { City } = require('../db/models')
const { createResponse, createErrorResponse } = require('../utils/responseHelper')

const getAllCities = async (req, res) => {
  try {
    const cities = await City.findAll({
      order: [['name_me', 'ASC']]
    })
    res.json(createResponse(cities, 'Cities retrieved successfully'))
  } catch (error) {
    console.error('Error fetching cities:', error)
    res.status(500).json(createErrorResponse('Failed to fetch cities', error.message))
  }
}

const getCityById = async (req, res) => {
  try {
    const { id } = req.params
    const city = await City.findByPk(id)

    if (!city) {
      return res.status(404).json(createErrorResponse('City not found'))
    }

    res.json(createResponse(city, 'City retrieved successfully'))
  } catch (error) {
    console.error('Error fetching city:', error)
    res.status(500).json(createErrorResponse('Failed to fetch city', error.message))
  }
}

const getCityBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const city = await City.findBySlug(slug)

    if (!city) {
      return res.status(404).json(createErrorResponse('City not found'))
    }

    res.json(createResponse(city, 'City retrieved successfully'))
  } catch (error) {
    console.error('Error fetching city:', error)
    res.status(500).json(createErrorResponse('Failed to fetch city', error.message))
  }
}

const createCity = async (req, res) => {
  try {
    const { slug, name_me, name_en } = req.body

    if (!slug || !name_me || !name_en) {
      return res.status(400).json(createErrorResponse('Missing required fields: slug, name_me, name_en'))
    }

    const existingCity = await City.findBySlug(slug)
    if (existingCity) {
      return res.status(409).json(createErrorResponse('City with this slug already exists'))
    }

    const city = await City.create({ slug, name_me, name_en })
    res.status(201).json(createResponse(city, 'City created successfully'))
  } catch (error) {
    console.error('Error creating city:', error)
    res.status(500).json(createErrorResponse('Failed to create city', error.message))
  }
}

const updateCity = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const existingCity = await City.findByPk(id)
    if (!existingCity) {
      return res.status(404).json(createErrorResponse('City not found'))
    }

    const updatedCity = await existingCity.update(updateData)
    res.json(createResponse(updatedCity, 'City updated successfully'))
  } catch (error) {
    console.error('Error updating city:', error)
    res.status(500).json(createErrorResponse('Failed to update city', error.message))
  }
}

const deleteCity = async (req, res) => {
  try {
    const { id } = req.params

    const existingCity = await City.findByPk(id)
    if (!existingCity) {
      return res.status(404).json(createErrorResponse('City not found'))
    }

    await existingCity.destroy()
    res.json(createResponse(null, 'City deleted successfully'))
  } catch (error) {
    console.error('Error deleting city:', error)
    res.status(500).json(createErrorResponse('Failed to delete city', error.message))
  }
}

module.exports = {
  getAllCities,
  getCityById,
  getCityBySlug,
  createCity,
  updateCity,
  deleteCity
}