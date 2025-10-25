const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PollVote = sequelize.define('PollVote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  poll_option_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'poll_options',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
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
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'poll_votes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['poll_id', 'user_id'] // User Only have one vote
    }
  ]
});

module.exports = PollVote;