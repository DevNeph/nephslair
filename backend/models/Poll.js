const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Poll = sequelize.define('Poll', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      len: [3, 500]
    }
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'posts',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  placement_type: {
    type: DataTypes.ENUM('project', 'post', 'both', 'standalone'),
    defaultValue: 'standalone',
    comment: 'Where the poll should be displayed'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Poll will automatically close after this date (null = no end date)'
  },
  is_finalized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Finalized polls cannot be reopened'
  },
  finalized_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the poll was finalized'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'polls',
  timestamps: false
});

module.exports = Poll;