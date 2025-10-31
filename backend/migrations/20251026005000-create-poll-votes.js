'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('poll_votes')
    );
    
    if (tableExists) {
      console.log('⚠️  Table "poll_votes" already exists, skipping creation...');
      return;
    }

    await queryInterface.createTable('poll_votes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      poll_option_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      poll_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    try {
      await queryInterface.addIndex('poll_votes', ['poll_option_id']);
      await queryInterface.addIndex('poll_votes', ['poll_id', 'user_id'], {
        unique: true,
        name: 'poll_votes_poll_user_unique'
      });
    } catch (err) {
      console.log('⚠️  Indexes on poll_votes may already exist, skipping...');
    }

    // Add foreign keys if referenced tables exist
    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('poll_options')) {
        await queryInterface.addConstraint('poll_votes', {
          fields: ['poll_option_id'],
          type: 'foreign key',
          name: 'poll_votes_poll_option_id_fkey',
          references: {
            table: 'poll_options',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint poll_votes -> poll_options');
    }

    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('users')) {
        await queryInterface.addConstraint('poll_votes', {
          fields: ['user_id'],
          type: 'foreign key',
          name: 'poll_votes_user_id_fkey',
          references: {
            table: 'users',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint poll_votes -> users');
    }

    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('polls')) {
        await queryInterface.addConstraint('poll_votes', {
          fields: ['poll_id'],
          type: 'foreign key',
          name: 'poll_votes_poll_id_fkey',
          references: {
            table: 'polls',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint poll_votes -> polls');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('poll_votes');
  }
};

