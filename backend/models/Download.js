const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Download = sequelize.define('Download', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'projects', key: 'id' }, onDelete: 'CASCADE' },
  title: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true } },
  description: { type: DataTypes.TEXT, allowNull: true },
  version: { type: DataTypes.STRING(50), allowNull: true },
  file_url: { type: DataTypes.STRING(500), allowNull: false, validate: { isUrl: true } },
  file_size: { type: DataTypes.BIGINT, allowNull: true, comment: 'File size in bytes' },
  file_type: { type: DataTypes.STRING(50), allowNull: true, comment: 'e.g., zip, exe, pdf' },
  download_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'downloads',
  timestamps: false,
  hooks: { beforeUpdate: (download) => { download.updated_at = new Date(); } },
  indexes: [
    { fields: ['project_id'] },
    { fields: ['is_active'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Download;