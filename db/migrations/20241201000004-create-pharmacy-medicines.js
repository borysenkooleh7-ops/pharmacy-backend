'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pharmacy_medicines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pharmacy_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pharmacies',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      medicine_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'medicines',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
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

    // Add composite unique constraint
    await queryInterface.addConstraint('pharmacy_medicines', {
      fields: ['pharmacy_id', 'medicine_id'],
      type: 'unique',
      name: 'unique_pharmacy_medicine'
    });

    // Add indexes
    await queryInterface.addIndex('pharmacy_medicines', ['pharmacy_id']);
    await queryInterface.addIndex('pharmacy_medicines', ['medicine_id']);
    await queryInterface.addIndex('pharmacy_medicines', ['available']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pharmacy_medicines');
  }
};