'use strict';

const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PharmacySubmission extends Model {
    static associate(models) {
      // Define associations here if needed
      // PharmacySubmission could have a relation to City through city_slug
    }

    // Instance methods
    canBeApproved() {
      return this.status === 'received' || this.status === 'reviewed';
    }

    getCoordinates() {
      if (this.lat && this.lng) {
        return {
          lat: parseFloat(this.lat),
          lng: parseFloat(this.lng)
        };
      }
      return null;
    }

    // Static methods
    static async findByStatus(status) {
      return await this.findAll({
        where: { status },
        order: [['created_at', 'DESC']]
      });
    }

    static async findPending() {
      return await this.findAll({
        where: {
          status: {
            [Op.in]: ['received', 'reviewed']
          }
        },
        order: [['created_at', 'ASC']]
      });
    }

    static async findByEmail(email) {
      return await this.findAll({
        where: { email },
        order: [['created_at', 'DESC']]
      });
    }

    static async getStatusCounts() {
      return await this.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('*')), 'count']
        ],
        group: ['status'],
        raw: true
      });
    }

    static async approve(id, pharmacyData) {
      const submission = await this.findByPk(id);
      if (!submission || !submission.canBeApproved()) {
        throw new Error('Submission cannot be approved');
      }

      // Create pharmacy record
      const pharmacy = await sequelize.models.Pharmacy.create({
        city_id: pharmacyData.city_id,
        name_me: pharmacyData.name_me || submission.name,
        name_en: pharmacyData.name_en || submission.name,
        address: submission.address,
        lat: submission.lat || pharmacyData.lat,
        lng: submission.lng || pharmacyData.lng,
        is_24h: submission.is_24h,
        open_sunday: submission.open_sunday,
        hours_monfri: pharmacyData.hours_monfri || '08:00–20:00',
        hours_sat: pharmacyData.hours_sat || '09:00–17:00',
        hours_sun: pharmacyData.hours_sun || 'Затворено',
        phone: submission.phone,
        website: submission.website,
        active: true
      });

      // Update submission status
      await submission.update({
        status: 'approved',
        review_notes: pharmacyData.review_notes || 'Approved and pharmacy created'
      });

      return { submission, pharmacy };
    }
  }

  PharmacySubmission.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name_me: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city_slug: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
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
    lat: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true
    },
    lng: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true
    },
    hours_monfri: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '08:00 - 20:00'
    },
    hours_sat: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '09:00 - 17:00'
    },
    hours_sun: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Closed'
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('received', 'reviewed', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'received'
    },
    review_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PharmacySubmission',
    tableName: 'pharmacy_submissions',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['city_slug']
      },
      {
        fields: ['email']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return PharmacySubmission;
};