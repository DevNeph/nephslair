module.exports = (sequelize, DataTypes) => {
  const PostRelease = sequelize.define('PostRelease', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    release_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'post_releases',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return PostRelease;
};