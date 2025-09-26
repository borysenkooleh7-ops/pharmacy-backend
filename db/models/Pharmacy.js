'use strict';

const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pharmacy extends Model {
    static associate(models) {
      // Pharmacy belongs to a city
      Pharmacy.belongsTo(models.City, {
        foreignKey: 'city_id',
        as: 'city'
      });

      // Pharmacy has many medicines (through pharmacy_medicines)
      Pharmacy.belongsToMany(models.Medicine, {
        through: 'pharmacy_medicines',
        foreignKey: 'pharmacy_id',
        otherKey: 'medicine_id',
        as: 'medicines'
      });
    }

    // Instance methods
    getDisplayName(language = 'me') {
      return language === 'en' && this.name_en ? this.name_en : this.name_me;
    }

    isOpenNow() {
      if (this.is_24h) return true;

      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const time = now.toTimeString().slice(0, 5); // HH:MM format

      let hours;
      if (day === 0) { // Sunday
        if (!this.open_sunday) return false;
        hours = this.hours_sun;
      } else if (day === 6) { // Saturday
        hours = this.hours_sat;
      } else { // Monday-Friday
        hours = this.hours_monfri;
      }

      // Simple check for common patterns
      if (hours.toLowerCase().includes('затворено') || hours.toLowerCase().includes('closed')) {
        return false;
      }

      return true; // Simplified - in real app, parse hours and compare with current time
    }

    // Static methods
    static async findWithFilters(filters = {}, language = 'me') {
      const where = { active: true };
      const include = [{
        model: sequelize.models.City,
        as: 'city',
        attributes: ['id', 'name_me', 'name_en', 'slug']
      }];

      // Apply filters
      if (filters.cityId) {
        where.city_id = filters.cityId;
      }

      if (filters.is24h === true) {
        where.is_24h = true;
      }

      if (filters.openSunday === true) {
        where.open_sunday = true;
      }

      if (filters.search) {
        where[Op.or] = [
          { name_me: { [Op.iLike]: `%${filters.search}%` } },
          { name_en: { [Op.iLike]: `%${filters.search}%` } },
          { address: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }

      // Determine sorting order - admin operations show most recent first
      const orderBy = filters.sortBy === 'recent' ?
        [['updated_at', 'DESC']] :
        [['name_me', 'ASC']];

      const options = {
        where,
        include,
        order: orderBy
      };

      // Pagination
      if (filters.limit) {
        options.limit = parseInt(filters.limit);
        if (filters.offset) {
          options.offset = parseInt(filters.offset);
        }
      }

      const result = await this.findAndCountAll(options);

      // Transform the rows to include display_name based on language
      if (result.rows) {
        result.rows = result.rows.map(pharmacy => {
          const pharmacyData = pharmacy.toJSON();
          pharmacyData.display_name = pharmacy.getDisplayName(language);
          return pharmacyData;
        });
      }

      return result;
    }

    static async findNearby(lat, lng, radiusKm = 10, limit = 20, language = 'me') {
      // Using Haversine formula for distance calculation with proper parameterization
      const query = `
        SELECT *,
        ( 6371 * acos( cos( radians(:lat) ) * cos( radians( lat ) )
          * cos( radians( lng ) - radians(:lng) ) + sin( radians(:lat) )
          * sin( radians( lat ) ) ) ) AS distance
        FROM pharmacies
        WHERE active = true
          AND ( 6371 * acos( cos( radians(:lat) ) * cos( radians( lat ) )
            * cos( radians( lng ) - radians(:lng) ) + sin( radians(:lat) )
            * sin( radians( lat ) ) ) ) < :radius
        ORDER BY ( 6371 * acos( cos( radians(:lat) ) * cos( radians( lat ) )
            * cos( radians( lng ) - radians(:lng) ) + sin( radians(:lat) )
            * sin( radians( lat ) ) ) )
        LIMIT :limit
      `;

      const pharmacies = await sequelize.query(query, {
        replacements: { lat, lng, radius: radiusKm, limit },
        type: sequelize.QueryTypes.SELECT,
        model: this,
        mapToModel: true
      });

      // Transform to include display_name based on language
      return pharmacies.map(pharmacy => {
        const pharmacyData = pharmacy.toJSON();
        pharmacyData.display_name = pharmacy.getDisplayName(language);
        return pharmacyData;
      });
    }

    static async findByCity(cityId, language = 'me') {
      const pharmacies = await this.findAll({
        where: {
          city_id: cityId,
          active: true
        },
        include: [{
          model: sequelize.models.City,
          as: 'city',
          attributes: ['name_me', 'name_en', 'slug']
        }],
        order: [['name_me', 'ASC']]
      });

      // Transform to include display_name based on language
      return pharmacies.map(pharmacy => {
        const pharmacyData = pharmacy.toJSON();
        pharmacyData.display_name = pharmacy.getDisplayName(language);
        return pharmacyData;
      });
    }
  }

  Pharmacy.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cities',
        key: 'id'
      }
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
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 300]
      }
    },
    lat: {
      type: DataTypes.DECIMAL(13, 10),
      allowNull: false,
      validate: {
        min: -90,
        max: 90
      },
      get() {
        const value = this.getDataValue('lat')
        return value !== null && value !== undefined ? parseFloat(value) : null
      }
    },
    lng: {
      type: DataTypes.DECIMAL(13, 10),
      allowNull: false,
      validate: {
        min: -180,
        max: 180
      },
      get() {
        const value = this.getDataValue('lng')
        return value !== null && value !== undefined ? parseFloat(value) : null
      }
    },
    is_24h: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    open_sunday: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    hours_monfri: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    hours_sat: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    hours_sun: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 20]
      }
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    google_place_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    google_rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Pharmacy',
    tableName: 'pharmacies',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['city_id']
      },
      {
        fields: ['is_24h']
      },
      {
        fields: ['open_sunday']
      },
      {
        fields: ['active']
      },
      {
        fields: ['lat', 'lng']
      }
    ]
  });

  return Pharmacy;
};