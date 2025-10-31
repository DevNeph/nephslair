'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('poll_options')
    );
    
    if (tableExists) {
      console.log('⚠️  Table "poll_options" already exists, skipping creation...');
      return;
    }

    await queryInterface.createTable('poll_options', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      poll_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      option_text: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      votes_count: {
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
      await queryInterface.addIndex('poll_options', ['poll_id']);
    } catch (err) {
      console.log('⚠️  Index on poll_options may already exist, skipping...');
    }

    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('polls')) {
        await queryInterface.addConstraint('poll_options', {
          fields: ['poll_id'],
          type: 'foreign key',
          name: 'poll_options_poll_id_fkey',
          references: {
            table: 'polls',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint poll_options -> polls');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('poll_options');
  }
};

