'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists (idempotent)
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('post_releases')
    );
    
    if (tableExists) {
      console.log('⚠️  Table "post_releases" already exists, skipping creation...');
      return;
    }

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

    // Add indexes
    try {
      await queryInterface.addIndex('post_releases', ['post_id']);
      await queryInterface.addIndex('post_releases', ['release_id']);
    } catch (err) {
      console.log('⚠️  Indexes on post_releases may already exist, skipping...');
    }

    // Unique constraint
    try {
      await queryInterface.addConstraint('post_releases', {
        fields: ['post_id', 'release_id'],
        type: 'unique',
        name: 'unique_post_release'
      });
    } catch (err) {
      console.log('⚠️  Unique constraint on post_releases may already exist, skipping...');
    }

    // Add foreign keys if referenced tables exist
    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('posts')) {
        await queryInterface.addConstraint('post_releases', {
          fields: ['post_id'],
          type: 'foreign key',
          name: 'post_releases_post_id_fkey',
          references: {
            table: 'posts',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint post_releases -> posts');
    }

    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('releases')) {
        await queryInterface.addConstraint('post_releases', {
          fields: ['release_id'],
          type: 'foreign key',
          name: 'post_releases_release_id_fkey',
          references: {
            table: 'releases',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint post_releases -> releases');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('post_releases');
  }
};