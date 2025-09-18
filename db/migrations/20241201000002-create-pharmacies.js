'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pharmacies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      city_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cities',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      name_me: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name_en: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lat: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false
      },
      lng: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false
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
        allowNull: false
      },
      hours_sat: {
        type: Sequelize.STRING,
        allowNull: false
      },
      hours_sun: {
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
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Add indexes for performance
    await queryInterface.addIndex('pharmacies', ['city_id']);
    await queryInterface.addIndex('pharmacies', ['is_24h']);
    await queryInterface.addIndex('pharmacies', ['open_sunday']);
    await queryInterface.addIndex('pharmacies', ['active']);

    // Add composite index for location-based queries
    await queryInterface.addIndex('pharmacies', ['lat', 'lng']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pharmacies');
  }
};