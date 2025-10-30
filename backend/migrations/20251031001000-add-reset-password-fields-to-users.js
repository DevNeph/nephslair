'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'reset_password_token', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'reset_password_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'reset_password_token');
    await queryInterface.removeColumn('users', 'reset_password_expires_at');
  }
};
