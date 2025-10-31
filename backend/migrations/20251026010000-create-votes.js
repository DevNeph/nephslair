'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('votes')
    );
    
    if (tableExists) {
      console.log('⚠️  Table "votes" already exists, skipping creation...');
      return;
    }

    await queryInterface.createTable('votes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      vote_type: {
        type: Sequelize.ENUM('upvote', 'downvote'),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    try {
      await queryInterface.addIndex('votes', ['post_id', 'user_id'], {
        unique: true,
        name: 'votes_post_user_unique'
      });
      await queryInterface.addIndex('votes', ['post_id']);
      await queryInterface.addIndex('votes', ['user_id']);
    } catch (err) {
      console.log('⚠️  Indexes on votes may already exist, skipping...');
    }

    // Add foreign keys if referenced tables exist
    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('posts')) {
        await queryInterface.addConstraint('votes', {
          fields: ['post_id'],
          type: 'foreign key',
          name: 'votes_post_id_fkey',
          references: {
            table: 'posts',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint votes -> posts');
    }

    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('users')) {
        await queryInterface.addConstraint('votes', {
          fields: ['user_id'],
          type: 'foreign key',
          name: 'votes_user_id_fkey',
          references: {
            table: 'users',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint votes -> users');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('votes');
  }
};

