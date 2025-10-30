const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Release = sequelize.define('Release', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE' },
  version: { type: DataTypes.STRING(50), allowNull: false, validate: { notEmpty: true } },
  release_notes: { type: DataTypes.TEXT('long'), allowNull: true, comment: 'Markdown formatted release notes' },
  release_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  is_published: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'releases',
  timestamps: false,
  hooks: { beforeUpdate: (release) => { release.updated_at = new Date(); } },
  indexes: [
    { fields: ['project_id'] },
    { fields: ['is_published'] },
    { fields: ['release_date'] }
  ]
});

module.exports = Release;