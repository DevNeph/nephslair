const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReleaseFile = sequelize.define('ReleaseFile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  release_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'releases', key: 'id' }, onDelete: 'CASCADE' },
  platform: { type: DataTypes.STRING, allowNull: false },
  file_name: { type: DataTypes.STRING, allowNull: false },
  file_url: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
  file_size: { type: DataTypes.BIGINT, allowNull: true },
  file_type: { type: DataTypes.STRING, allowNull: true },
  download_count: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'release_files',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['release_id'] }
  ]
});

module.exports = ReleaseFile;