'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('post_polls')
    );
    
    if (tableExists) {
      console.log('⚠️  Table "post_polls" already exists, skipping creation...');
      return;
    }

    await queryInterface.createTable('post_polls', {
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
      poll_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    try {
      await queryInterface.addIndex('post_polls', ['post_id']);
      await queryInterface.addIndex('post_polls', ['poll_id']);
      await queryInterface.addIndex('post_polls', ['post_id', 'poll_id'], {
        unique: true,
        name: 'unique_post_poll'
      });
    } catch (err) {
      console.log('⚠️  Indexes on post_polls may already exist, skipping...');
    }

    // Add foreign keys if referenced tables exist
    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('posts')) {
        await queryInterface.addConstraint('post_polls', {
          fields: ['post_id'],
          type: 'foreign key',
          name: 'post_polls_post_id_fkey',
          references: {
            table: 'posts',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint post_polls -> posts');
    }

    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('polls')) {
        await queryInterface.addConstraint('post_polls', {
          fields: ['poll_id'],
          type: 'foreign key',
          name: 'post_polls_poll_id_fkey',
          references: {
            table: 'polls',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint post_polls -> polls');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('post_polls');
  }
};

