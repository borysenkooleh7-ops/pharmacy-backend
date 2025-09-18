const { Medicine, PharmacyMedicine, Pharmacy, City } = require('../db/models')
const { createResponse, createErrorResponse, createPaginatedResponse } = require('../utils/responseHelper')
const { Op } = require('sequelize')
const config = require('../config')

const getAllMedicines = async (req, res) => {
  try {
    const { search, page = 1, limit = config.pagination.defaultLimit } = req.query

    const filters = {
      search,
      limit: Math.min(parseInt(limit), config.pagination.maxLimit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    }

    let whereClause = { active: true }

    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { name_me: { [Op.iLike]: `%${search}%` } },
          { name_en: { [Op.iLike]: `%${search}%` } }
        ]
      }
    }

    const result = await Medicine.findAndCountAll({
      where: whereClause,
      order: [['name_me', 'ASC']],
      limit: filters.limit,
      offset: filters.offset
    })

    const medicines = result.rows || []
    const total = result.count || 0

    const paginatedResponse = createPaginatedResponse(
      medicines,
      total,
      parseInt(page),
      parseInt(limit),
      'Medicines retrieved successfully'
    )

    res.json(paginatedResponse)
  } catch (error) {
    console.error('Error fetching medicines:', error)
    res.status(500).json(createErrorResponse('Failed to fetch medicines', error.message))
  }
}

const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params

    const medicine = await Medicine.findByPk(id, {
      include: [{
        model: PharmacyMedicine,
        as: 'pharmacyMedicines',
        include: [{
          model: Pharmacy,
          as: 'pharmacy',
          include: [{
            model: City,
            as: 'city'
          }]
        }]
      }]
    })

    if (!medicine) {
      return res.status(404).json(createErrorResponse('Medicine not found'))
    }

    res.json(createResponse(medicine, 'Medicine retrieved successfully'))
  } catch (error) {
    console.error('Error fetching medicine:', error)
    res.status(500).json(createErrorResponse('Failed to fetch medicine', error.message))
  }
}

const searchMedicines = async (req, res) => {
  try {
    const { name } = req.params
    const { cityId, page = 1, limit = config.pagination.defaultLimit } = req.query

    const filters = {
      limit: Math.min(parseInt(limit), config.pagination.maxLimit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    }

    let pharmacyWhere = { active: true }
    if (cityId) {
      pharmacyWhere.city_id = cityId
    }

    const medicines = await Medicine.findAll({
      where: {
        active: true,
        [Op.or]: [
          { name_me: { [Op.iLike]: `%${name}%` } },
          { name_en: { [Op.iLike]: `%${name}%` } }
        ]
      },
      include: [{
        model: PharmacyMedicine,
        as: 'pharmacyMedicines',
        where: { available: true },
        required: false,
        include: [{
          model: Pharmacy,
          as: 'pharmacy',
          where: pharmacyWhere,
          include: [{
            model: City,
            as: 'city'
          }]
        }]
      }],
      order: [['name_me', 'ASC']],
      limit: filters.limit,
      offset: filters.offset
    })

    res.json(createResponse(medicines, 'Medicines search completed successfully'))
  } catch (error) {
    console.error('Error searching medicines:', error)
    res.status(500).json(createErrorResponse('Failed to search medicines', error.message))
  }
}

const createMedicine = async (req, res) => {
  try {
    const { name_me, name_en, description, active = true } = req.body

    if (!name_me) {
      return res.status(400).json(createErrorResponse('Medicine name (Montenegrin) is required'))
    }

    const medicine = await Medicine.create({
      name_me,
      name_en,
      description,
      active
    })

    res.status(201).json(createResponse(medicine, 'Medicine created successfully'))
  } catch (error) {
    console.error('Error creating medicine:', error)
    res.status(500).json(createErrorResponse('Failed to create medicine', error.message))
  }
}

const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params
    const { name_me, name_en, description, active } = req.body

    const medicine = await Medicine.findByPk(id)
    if (!medicine) {
      return res.status(404).json(createErrorResponse('Medicine not found'))
    }

    await medicine.update({
      name_me: name_me || medicine.name_me,
      name_en: name_en !== undefined ? name_en : medicine.name_en,
      description: description !== undefined ? description : medicine.description,
      active: active !== undefined ? active : medicine.active
    })

    res.json(createResponse(medicine, 'Medicine updated successfully'))
  } catch (error) {
    console.error('Error updating medicine:', error)
    res.status(500).json(createErrorResponse('Failed to update medicine', error.message))
  }
}

const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params

    const medicine = await Medicine.findByPk(id)
    if (!medicine) {
      return res.status(404).json(createErrorResponse('Medicine not found'))
    }

    await medicine.destroy()

    res.json(createResponse(null, 'Medicine deleted successfully'))
  } catch (error) {
    console.error('Error deleting medicine:', error)
    res.status(500).json(createErrorResponse('Failed to delete medicine', error.message))
  }
}

module.exports = {
  getAllMedicines,
  getMedicineById,
  searchMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine
}