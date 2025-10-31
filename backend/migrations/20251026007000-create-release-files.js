'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('release_files')
    );
    
    if (tableExists) {
      console.log('⚠️  Table "release_files" already exists, skipping creation...');
      return;
    }

    await queryInterface.createTable('release_files', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      release_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      platform: {
        type: Sequelize.STRING,
        allowNull: false
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      file_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      file_size: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      file_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      download_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
      await queryInterface.addIndex('release_files', ['release_id']);
    } catch (err) {
      console.log('⚠️  Index on release_files may already exist, skipping...');
    }

    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('releases')) {
        await queryInterface.addConstraint('release_files', {
          fields: ['release_id'],
          type: 'foreign key',
          name: 'release_files_release_id_fkey',
          references: {
            table: 'releases',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint release_files -> releases');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('release_files');
  }
};

