'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('pharmacies', 'google_place_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('pharmacies', 'google_rating', {
      type: Sequelize.DECIMAL(2, 1),
      allowNull: true
    });

    // Add index on google_place_id for faster lookups
    await queryInterface.addIndex('pharmacies', ['google_place_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('pharmacies', ['google_place_id']);
    await queryInterface.removeColumn('pharmacies', 'google_rating');
    await queryInterface.removeColumn('pharmacies', 'google_place_id');
  }
};
