'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('releases')
    );
    
    if (tableExists) {
      console.log('⚠️  Table "releases" already exists, skipping creation...');
      return;
    }

    await queryInterface.createTable('releases', {
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
      release_notes: {
        type: Sequelize.TEXT('long'),
        allowNull: true
      },
      release_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
      await queryInterface.addIndex('releases', ['project_id']);
      await queryInterface.addIndex('releases', ['is_published']);
      await queryInterface.addIndex('releases', ['release_date']);
    } catch (err) {
      console.log('⚠️  Indexes on releases may already exist, skipping...');
    }

    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('projects')) {
        await queryInterface.addConstraint('releases', {
          fields: ['project_id'],
          type: 'foreign key',
          name: 'releases_project_id_fkey',
          references: {
            table: 'projects',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint releases -> projects');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('releases');
  }
};

