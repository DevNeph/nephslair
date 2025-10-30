const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Settings = sequelize.define('Settings', {
    key: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'string'
    }
  }, {
    tableName: 'settings',
    timestamps: true
  });

  return Settings;
};
