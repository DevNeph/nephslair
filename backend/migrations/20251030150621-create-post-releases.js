'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('post_releases', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      release_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'releases',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Unique constraint
    await queryInterface.addConstraint('post_releases', {
      fields: ['post_id', 'release_id'],
      type: 'unique',
      name: 'unique_post_release'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('post_releases');
  }
};