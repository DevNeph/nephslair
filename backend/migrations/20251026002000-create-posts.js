'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables().then(tables => 
      tables.includes('posts')
    );
    
    if (tableExists) {
      console.log('⚠️  Table "posts" already exists, skipping creation...');
      return;
    }

    await queryInterface.createTable('posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      excerpt: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'published'),
        defaultValue: 'published',
        allowNull: false
      },
      upvotes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      downvotes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      published_at: {
        type: Sequelize.DATE,
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
      await queryInterface.addIndex('posts', ['slug'], { unique: true });
      await queryInterface.addIndex('posts', ['project_id']);
      await queryInterface.addIndex('posts', ['author_id']);
      await queryInterface.addIndex('posts', ['status']);
      await queryInterface.addIndex('posts', ['published_at']);
    } catch (err) {
      console.log('⚠️  Indexes on posts may already exist, skipping...');
    }

    // Add foreign keys if referenced tables exist
    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('users')) {
        await queryInterface.addConstraint('posts', {
          fields: ['author_id'],
          type: 'foreign key',
          name: 'posts_author_id_fkey',
          references: {
            table: 'users',
            field: 'id'
          },
          onDelete: 'CASCADE'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint posts -> users');
    }

    try {
      const allTables = await queryInterface.showAllTables();
      if (allTables.includes('projects')) {
        await queryInterface.addConstraint('posts', {
          fields: ['project_id'],
          type: 'foreign key',
          name: 'posts_project_id_fkey',
          references: {
            table: 'projects',
            field: 'id'
          },
          onDelete: 'SET NULL'
        });
      }
    } catch (err) {
      console.log('⚠️  Could not add FK constraint posts -> projects');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('posts');
  }
};

