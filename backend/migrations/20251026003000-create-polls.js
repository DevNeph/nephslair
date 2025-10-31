'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('polls')
    );
    
    if (tableExists) {
      console.log('⚠️  Table "polls" already exists, skipping creation...');
      return;
    }

    await queryInterface.createTable('polls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      question: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      show_on_homepage: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_standalone: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_finalized: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      finalized_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    try {
      await queryInterface.addIndex('polls', ['project_id']);
      await queryInterface.addIndex('polls', ['post_id']);
      await queryInterface.addIndex('polls', ['is_active']);
      await queryInterface.addIndex('polls', ['show_on_homepage']);
      await queryInterface.addIndex('polls', ['end_date']);
    } catch (err) {
      console.log('⚠️  Indexes on polls may already exist, skipping...');
    }

    // Add foreign keys if referenced tables exist
    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('projects')) {
        await queryInterface.addConstraint('polls', {
          fields: ['project_id'],
          type: 'foreign key',
          name: 'polls_project_id_fkey',
          references: {
            table: 'projects',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint polls -> projects');
    }

    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('posts')) {
        await queryInterface.addConstraint('polls', {
          fields: ['post_id'],
          type: 'foreign key',
          name: 'polls_post_id_fkey',
          references: {
            table: 'posts',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint polls -> posts');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('polls');
  }
};

