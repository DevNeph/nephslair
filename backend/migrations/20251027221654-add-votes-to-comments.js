'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('comments', 'upvotes', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
    
    await queryInterface.addColumn('comments', 'downvotes', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('comments', 'upvotes');
    await queryInterface.removeColumn('comments', 'downvotes');
  }
};