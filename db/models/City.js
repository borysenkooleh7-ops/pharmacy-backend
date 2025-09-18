'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    static associate(models) {
      // City has many pharmacies
      City.hasMany(models.Pharmacy, {
        foreignKey: 'city_id',
        as: 'pharmacies'
      });
    }

    // Instance methods
    getDisplayName(language = 'me') {
      return language === 'en' && this.name_en ? this.name_en : this.name_me;
    }

    // Static methods
    static async findBySlug(slug) {
      return await this.findOne({
        where: { slug }
      });
    }

    static async findAllWithPharmacyCount() {
      return await this.findAll({
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*)
                FROM pharmacies AS pharmacy
                WHERE pharmacy.city_id = City.id
                AND pharmacy.active = true
              )`),
              'pharmacy_count'
            ]
          ]
        },
        order: [['name_me', 'ASC']]
      });
    }
  }

  City.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isLowercase: true,
        is: /^[a-z0-9-]+$/
      }
    },
    name_me: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    }
  }, {
    sequelize,
    modelName: 'City',
    tableName: 'cities',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['slug']
      },
      {
        fields: ['name_me']
      },
      {
        fields: ['name_en']
      }
    ]
  });

  return City;
};