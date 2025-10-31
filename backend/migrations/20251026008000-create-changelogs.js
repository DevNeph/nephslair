'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('changelogs')
    );
    
    if (tableExists) {
      console.log('⚠️  Table "changelogs" already exists, skipping creation...');
      return;
    }

    await queryInterface.createTable('changelogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      version: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      explanation: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      release_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: true
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

    try {
      await queryInterface.addIndex('changelogs', ['project_id']);
      await queryInterface.addIndex('changelogs', ['release_date']);
    } catch (err) {
      console.log('⚠️  Indexes on changelogs may already exist, skipping...');
    }

    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('projects')) {
        await queryInterface.addConstraint('changelogs', {
          fields: ['project_id'],
          type: 'foreign key',
          name: 'changelogs_project_id_fkey',
          references: {
            table: 'projects',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint changelogs -> projects');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('changelogs');
  }
};

