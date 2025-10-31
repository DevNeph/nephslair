'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists (idempotent)
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('users')
    );
    
    if (tableExists) {
      console.log('⚠️  Table "users" already exists, skipping creation...');
      return;
    }

    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        defaultValue: 'user',
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    try {
      await queryInterface.addIndex('users', ['email'], { unique: true });
      await queryInterface.addIndex('users', ['username'], { unique: true });
    } catch (err) {
      console.log('⚠️  Indexes on users may already exist, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};

