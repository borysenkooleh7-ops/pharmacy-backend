'use strict';

const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Medicine extends Model {
    static associate(models) {
      // Medicine belongs to many pharmacies (through pharmacy_medicines)
      Medicine.belongsToMany(models.Pharmacy, {
        through: 'pharmacy_medicines',
        foreignKey: 'medicine_id',
        otherKey: 'pharmacy_id',
        as: 'pharmacies'
      });
    }

    // Instance methods
    getDisplayName(language = 'me') {
      return language === 'en' && this.name_en ? this.name_en : this.name_me;
    }

    // Static methods
    static async searchByName(searchTerm, language = 'me') {
      const field = language === 'en' ? 'name_en' : 'name_me';

      return await this.findAll({
        where: {
          [field]: {
            [Op.iLike]: `%${searchTerm}%`
          },
          active: true
        },
        order: [[field, 'ASC']],
        limit: 50
      });
    }

    static async findAvailableInPharmacies(cityId = null) {
      const include = [{
        model: sequelize.models.Pharmacy,
        as: 'pharmacies',
        where: { active: true },
        through: {
          where: { available: true }
        }
      }];

      if (cityId) {
        include[0].where.city_id = cityId;
      }

      return await this.findAll({
        where: { active: true },
        include,
        order: [['name_me', 'ASC']]
      });
    }
  }

  Medicine.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name_me: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200]
      }
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Medicine',
    tableName: 'medicines',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['name_me']
      },
      {
        fields: ['name_en']
      },
      {
        fields: ['active']
      }
    ]
  });

  return Medicine;
};