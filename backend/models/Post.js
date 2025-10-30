const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  project_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'projects', key: 'id' }, onDelete: 'SET NULL' },
  author_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
  title: { type: DataTypes.STRING(255), allowNull: false, validate: { len: [3, 255] } },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { is: /^[a-z0-9-]+$/i } },
  content: { type: DataTypes.TEXT('long'), allowNull: false },
  excerpt: { type: DataTypes.STRING(500), allowNull: true },
  status: { type: DataTypes.ENUM('draft', 'published'), defaultValue: 'published', allowNull: false },
  upvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  downvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  published_at: { type: DataTypes.DATE, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'posts',
  timestamps: false,
  hooks: { beforeUpdate: (post) => { post.updated_at = new Date(); } },
  indexes: [
    { fields: ['project_id'] },
    { fields: ['author_id'] },
    { fields: ['status'] },
    { fields: ['published_at'] }
  ]
});

module.exports = Post;