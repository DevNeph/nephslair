'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CommentVote extends Model {
    static associate(models) {
      // User association
      CommentVote.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // Comment association
      CommentVote.belongsTo(models.Comment, {
        foreignKey: 'comment_id',
        as: 'comment'
      });
    }
  }
  
  CommentVote.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comment_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    vote_type: {
      type: DataTypes.ENUM('upvote', 'downvote'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'CommentVote',
    tableName: 'comment_votes',
    underscored: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ['user_id', 'comment_id'], name: 'unique_user_comment_vote' },
      { fields: ['comment_id'] },
      { fields: ['user_id'] }
    ]
  });
  
  return CommentVote;
};