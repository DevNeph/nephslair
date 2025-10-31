'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists (idempotent)
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('comments')
    );
    
    if (tableExists) {
      console.log('⚠️  Table "comments" already exists, skipping creation...');
      return;
    }

    await queryInterface.createTable('comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // Note: Foreign key constraint will be added after posts table exists
        // For now, just store the integer reference
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // Note: Foreign key constraint will be added after users table exists
        // For now, just store the integer reference
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
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
    try {
      await queryInterface.addIndex('comments', ['post_id']);
    } catch (err) {
      console.log('⚠️  Index on comments(post_id) may already exist, skipping...');
    }
    
    try {
      await queryInterface.addIndex('comments', ['user_id']);
    } catch (err) {
      console.log('⚠️  Index on comments(user_id) may already exist, skipping...');
    }
    
    try {
      await queryInterface.addIndex('comments', ['created_at']);
    } catch (err) {
      console.log('⚠️  Index on comments(created_at) may already exist, skipping...');
    }

    // Try to add foreign keys if referenced tables exist
    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('posts')) {
        await queryInterface.addConstraint('comments', {
          fields: ['post_id'],
          type: 'foreign key',
          name: 'comments_post_id_fkey',
          references: {
            table: 'posts',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint comments -> posts (table may not exist yet)');
    }

    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('users')) {
        await queryInterface.addConstraint('comments', {
          fields: ['user_id'],
          type: 'foreign key',
          name: 'comments_user_id_fkey',
          references: {
            table: 'users',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint comments -> users (table may not exist yet)');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comments');
  }
};

