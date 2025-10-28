const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Changelog = sequelize.define('Changelog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  version: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  explanation: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  release_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: 'JSON string of sections and items'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'changelogs',
  timestamps: false,
  hooks: {
    beforeUpdate: (changelog) => {
      changelog.updated_at = new Date();
    }
  }
});

module.exports = Changelog;