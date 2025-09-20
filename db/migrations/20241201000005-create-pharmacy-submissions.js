'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pharmacy_submissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name_me: {
        type: Sequelize.STRING,
        allowNull: true
      },
      name_en: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      city_slug: {
        type: Sequelize.STRING,
        allowNull: true
      },
      city_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'cities',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_24h: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      open_sunday: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      hours_monfri: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '08:00 - 20:00'
      },
      hours_sat: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '09:00 - 17:00'
      },
      hours_sun: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'Closed'
      },
      lat: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true
      },
      lng: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('received', 'reviewed', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'received'
      },
      review_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('pharmacy_submissions', ['status']);
    await queryInterface.addIndex('pharmacy_submissions', ['city_slug']);
    await queryInterface.addIndex('pharmacy_submissions', ['city_id']);
    await queryInterface.addIndex('pharmacy_submissions', ['lat', 'lng']);
    await queryInterface.addIndex('pharmacy_submissions', ['active']);
    await queryInterface.addIndex('pharmacy_submissions', ['created_at']);
    await queryInterface.addIndex('pharmacy_submissions', ['email']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pharmacy_submissions');
  }
};