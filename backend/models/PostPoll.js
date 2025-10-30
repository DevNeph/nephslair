const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostPoll = sequelize.define('PostPoll', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  poll_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'polls',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'post_polls',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['post_id', 'poll_id'],
      name: 'unique_post_poll'
    }
  ]
});

module.exports = PostPoll;