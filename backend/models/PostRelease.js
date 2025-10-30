module.exports = (sequelize, DataTypes) => {
  const PostRelease = sequelize.define('PostRelease', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    post_id: { type: DataTypes.INTEGER, allowNull: false },
    release_id: { type: DataTypes.INTEGER, allowNull: false },
    display_order: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    tableName: 'post_releases',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['post_id', 'release_id'], name: 'unique_post_release' },
      { fields: ['post_id'] },
      { fields: ['release_id'] }
    ]
  });

  return PostRelease;
};