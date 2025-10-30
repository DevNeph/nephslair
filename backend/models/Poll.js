// backend/models/Poll.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Poll = sequelize.define('Poll', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  question: { type: DataTypes.STRING(500), allowNull: false, validate: { len: [3, 500] } },
  project_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE' },
  post_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'posts', key: 'id' }, onDelete: 'CASCADE' },
  show_on_homepage: { type: DataTypes.BOOLEAN, defaultValue: false, comment: 'Show this poll on homepage sidebar' },
  is_standalone: { type: DataTypes.BOOLEAN, defaultValue: true, comment: 'Can be added to posts manually' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  end_date: { type: DataTypes.DATE, allowNull: true, comment: 'Poll will automatically close after this date (null = no end date)' },
  is_finalized: { type: DataTypes.BOOLEAN, defaultValue: false, comment: 'Finalized polls cannot be reopened' },
  finalized_at: { type: DataTypes.DATE, allowNull: true, comment: 'When the poll was finalized' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'polls',
  timestamps: false,
  indexes: [
    { fields: ['project_id'] },
    { fields: ['post_id'] },
    { fields: ['is_active'] },
    { fields: ['show_on_homepage'] },
    { fields: ['end_date'] }
  ]
});

module.exports = Poll;