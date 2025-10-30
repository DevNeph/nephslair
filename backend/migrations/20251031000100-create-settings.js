'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      key: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: ''
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'string'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('settings');
  }
};
