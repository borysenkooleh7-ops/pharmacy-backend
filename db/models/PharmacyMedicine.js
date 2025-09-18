'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PharmacyMedicine extends Model {
    static associate(models) {
      // PharmacyMedicine belongs to Pharmacy
      PharmacyMedicine.belongsTo(models.Pharmacy, {
        foreignKey: 'pharmacy_id',
        as: 'pharmacy'
      });

      // PharmacyMedicine belongs to Medicine
      PharmacyMedicine.belongsTo(models.Medicine, {
        foreignKey: 'medicine_id',
        as: 'medicine'
      });
    }

    // Instance methods
    isInStock() {
      return this.available && (this.stock_quantity === null || this.stock_quantity > 0);
    }

    // Static methods
    static async findByPharmacy(pharmacyId) {
      return await this.findAll({
        where: {
          pharmacy_id: pharmacyId,
          available: true
        },
        include: [{
          model: sequelize.models.Medicine,
          as: 'medicine',
          where: { active: true }
        }],
        order: [['medicine', 'name_me', 'ASC']]
      });
    }

    static async findByMedicine(medicineId, cityId = null) {
      const include = [{
        model: sequelize.models.Pharmacy,
        as: 'pharmacy',
        where: { active: true },
        include: [{
          model: sequelize.models.City,
          as: 'city'
        }]
      }];

      if (cityId) {
        include[0].where.city_id = cityId;
      }

      return await this.findAll({
        where: {
          medicine_id: medicineId,
          available: true
        },
        include,
        order: [['price', 'ASC']]
      });
    }

    static async updateStock(pharmacyId, medicineId, stockData) {
      return await this.update(stockData, {
        where: {
          pharmacy_id: pharmacyId,
          medicine_id: medicineId
        }
      });
    }
  }

  PharmacyMedicine.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    pharmacy_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pharmacies',
        key: 'id'
      }
    },
    medicine_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medicines',
        key: 'id'
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'PharmacyMedicine',
    tableName: 'pharmacy_medicines',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['pharmacy_id', 'medicine_id']
      },
      {
        fields: ['pharmacy_id']
      },
      {
        fields: ['medicine_id']
      },
      {
        fields: ['available']
      },
      {
        fields: ['price']
      }
    ]
  });

  return PharmacyMedicine;
};