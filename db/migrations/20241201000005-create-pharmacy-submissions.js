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
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      city_slug: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
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
        allowNull: false
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
    await queryInterface.addIndex('pharmacy_submissions', ['created_at']);
    await queryInterface.addIndex('pharmacy_submissions', ['email']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pharmacy_submissions');
  }
};