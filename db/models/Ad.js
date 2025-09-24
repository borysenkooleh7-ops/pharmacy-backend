'use strict';

const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ad extends Model {
    static associate(models) {
      // Define associations here if needed
    }

    // Instance methods
    getDisplayName(language = 'me') {
      return language === 'en' && this.name_en ? this.name_en : this.name_me;
    }

    isActive() {
      if (!this.active) return false;

      const now = new Date();

      // Check start date
      if (this.start_date && now < this.start_date) return false;

      // Check end date
      if (this.end_date && now > this.end_date) return false;

      return true;
    }

    incrementClicks() {
      return this.increment('click_count');
    }

    incrementImpressions() {
      return this.increment('impression_count');
    }

    getClickThroughRate() {
      if (this.impression_count === 0) return 0;
      return (this.click_count / this.impression_count) * 100;
    }

    // Static methods
    static async findActiveAds(language = 'me') {
      const now = new Date();

      const ads = await this.findAll({
        where: {
          active: true,
          [Op.or]: [
            { start_date: null },
            { start_date: { [Op.lte]: now } }
          ],
          [Op.or]: [
            { end_date: null },
            { end_date: { [Op.gte]: now } }
          ]
        },
        order: [
          ['weight', 'DESC'],
          [sequelize.fn('RANDOM')]
        ]
      });

      // Transform to include display_name based on language
      return ads.map(ad => {
        const adData = ad.toJSON();
        adData.display_name = ad.getDisplayName(language);
        return adData;
      });
    }

    static async findForRotation(limit = 5) {
      return await this.findActiveAds().then(ads => {
        // Weighted random selection based on weight
        const weightedAds = [];
        ads.forEach(ad => {
          for (let i = 0; i < ad.weight; i++) {
            weightedAds.push(ad);
          }
        });

        // Shuffle and return limited results
        const shuffled = weightedAds.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
      });
    }

    static async getAnalytics(dateFrom = null, dateTo = null) {
      let where = {};

      if (dateFrom || dateTo) {
        where.created_at = {};
        if (dateFrom) where.created_at[Op.gte] = dateFrom;
        if (dateTo) where.created_at[Op.lte] = dateTo;
      }

      return await this.findAll({
        where,
        attributes: [
          'id',
          'name_me',
          'name_en',
          'click_count',
          'impression_count',
          [sequelize.literal('CASE WHEN impression_count > 0 THEN (click_count::float / impression_count * 100) ELSE 0 END'), 'ctr'],
          'active',
          'weight'
        ],
        order: [['click_count', 'DESC']]
      });
    }

    static async recordClick(adId) {
      return await this.increment('click_count', {
        where: { id: adId }
      });
    }

    static async recordImpression(adId) {
      return await this.increment('impression_count', {
        where: { id: adId }
      });
    }
  }

  Ad.init({
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
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: true
      }
    },
    target_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: true
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0,
        max: 10
      }
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isAfterStartDate(value) {
          if (value && this.start_date && value <= this.start_date) {
            throw new Error('End date must be after start date');
          }
        }
      }
    },
    click_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    impression_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'Ad',
    tableName: 'ads',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['active']
      },
      {
        fields: ['weight']
      },
      {
        fields: ['start_date', 'end_date']
      },
      {
        fields: ['click_count']
      },
      {
        fields: ['impression_count']
      }
    ]
  });

  return Ad;
};