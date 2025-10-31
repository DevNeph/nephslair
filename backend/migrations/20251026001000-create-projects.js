'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('projects')
    );
    
    if (tableExists) {
      console.log('⚠️  Table "projects" already exists, skipping creation...');
      return;
    }

    await queryInterface.createTable('projects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'published'),
        defaultValue: 'draft',
        allowNull: false
      },
      latest_version: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: null
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
      await queryInterface.addIndex('projects', ['slug'], { unique: true });
      await queryInterface.addIndex('projects', ['name'], { unique: true });
    } catch (err) {
      console.log('⚠️  Indexes on projects may already exist, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('projects');
  }
};

