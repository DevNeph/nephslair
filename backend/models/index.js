// backend/models/index.js

const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Post = require('./Post');
const Comment = require('./Comment');
const Vote = require('./Vote');
const Poll = require('./Poll');
const PollOption = require('./PollOption');
const PollVote = require('./PollVote');
const Release = require('./Release');
const ReleaseFile = require('./ReleaseFile');
const Changelog = require('./Changelog');
const CommentVote = require('./commentvote')(sequelize, require('sequelize').DataTypes);
const CommentHistory = require('./CommentHistory');
const PostPoll = require('./PostPoll'); 
const PostRelease = require('./PostRelease')(sequelize, require('sequelize').DataTypes);
const Settings = require('./Settings')(sequelize);

// ==========================================
// DEFINE RELATIONSHIPS
// ==========================================

// User - Post relationship
User.hasMany(Post, { foreignKey: 'author_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// Project - Post relationship
Project.hasMany(Post, { foreignKey: 'project_id', as: 'posts' });
Post.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Post - Comment relationship
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// User - Comment relationship
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Comment - Comment relationship (nested/replies)
Comment.hasMany(Comment, { foreignKey: 'parent_id', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parent_id', as: 'parent' });

// Comment - CommentVote relationship
Comment.hasMany(CommentVote, { foreignKey: 'comment_id', as: 'commentVotes' });
CommentVote.belongsTo(Comment, { foreignKey: 'comment_id', as: 'comment' });

// User - CommentVote relationship
User.hasMany(CommentVote, { foreignKey: 'user_id', as: 'commentVotes' });
CommentVote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Comment History
Comment.hasMany(CommentHistory, { foreignKey: 'comment_id', as: 'history' });
CommentHistory.belongsTo(Comment, { foreignKey: 'comment_id', as: 'comment' });

// Post - Vote relationship
Post.hasMany(Vote, { foreignKey: 'post_id', as: 'votes' });
Vote.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// User - Vote relationship
User.hasMany(Vote, { foreignKey: 'user_id', as: 'votes' });
Vote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ==========================================
// POLL RELATIONSHIPS
// ==========================================

// Post - Poll relationship (OPTIONAL)
Post.hasMany(Poll, { foreignKey: 'post_id', as: 'polls' });
Poll.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// Project - Poll relationship (OPTIONAL)
Project.hasMany(Poll, { foreignKey: 'project_id', as: 'polls' });
Poll.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Poll - PollOption relationship
Poll.hasMany(PollOption, { foreignKey: 'poll_id', as: 'options' });
PollOption.belongsTo(Poll, { foreignKey: 'poll_id', as: 'poll' });

// PollOption - PollVote relationship
PollOption.hasMany(PollVote, { foreignKey: 'poll_option_id', as: 'votes' });
PollVote.belongsTo(PollOption, { foreignKey: 'poll_option_id', as: 'option' });

// User - PollVote relationship
User.hasMany(PollVote, { foreignKey: 'user_id', as: 'pollVotes' });
PollVote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Poll - PollVote relationship
Poll.hasMany(PollVote, { foreignKey: 'poll_id', as: 'votes' });
PollVote.belongsTo(Poll, { foreignKey: 'poll_id', as: 'poll' });

// ==========================================
// RELEASE RELATIONSHIPS
// ==========================================

// Project - Release relationship
Project.hasMany(Release, { foreignKey: 'project_id', as: 'releases', onDelete: 'CASCADE' });
Release.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Release - ReleaseFile relationship
Release.hasMany(ReleaseFile, { foreignKey: 'release_id', as: 'files', onDelete: 'CASCADE' });
ReleaseFile.belongsTo(Release, { foreignKey: 'release_id', as: 'release' });

// ==========================================
// CHANGELOG RELATIONSHIPS
// ==========================================

// Project - Changelog relationship
Project.hasMany(Changelog, { foreignKey: 'project_id', as: 'changelogs' });
Changelog.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// ==========================================
// POST-POLL MANY-TO-MANY
// ==========================================

// Post <-> Poll (Many-to-Many through PostPoll)
Post.belongsToMany(Poll, { 
  through: PostPoll, 
  foreignKey: 'post_id', 
  otherKey: 'poll_id',
  as: 'attachedPolls'
});

Poll.belongsToMany(Post, { 
  through: PostPoll, 
  foreignKey: 'poll_id', 
  otherKey: 'post_id',
  as: 'attachedPosts'
});

// PostPoll - Post relationship
PostPoll.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
Post.hasMany(PostPoll, { foreignKey: 'post_id', as: 'postPolls' });

// PostPoll - Poll relationship
PostPoll.belongsTo(Poll, { foreignKey: 'poll_id', as: 'poll' });
Poll.hasMany(PostPoll, { foreignKey: 'poll_id', as: 'postPolls' });

// ==========================================
// POST-RELEASE MANY-TO-MANY
// ==========================================

// Post <-> Release (Many-to-Many through PostRelease)
Post.belongsToMany(Release, { 
  through: PostRelease, 
  foreignKey: 'post_id', 
  otherKey: 'release_id',
  as: 'attachedReleases'
});

Release.belongsToMany(Post, { 
  through: PostRelease, 
  foreignKey: 'release_id', 
  otherKey: 'post_id',
  as: 'attachedPosts'
});

// PostRelease - Post relationship
PostRelease.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
Post.hasMany(PostRelease, { foreignKey: 'post_id', as: 'postReleases' });

// PostRelease - Release relationship
PostRelease.belongsTo(Release, { foreignKey: 'release_id', as: 'release' });
Release.hasMany(PostRelease, { foreignKey: 'release_id', as: 'postReleases' });

// ==========================================
// DATABASE SYNC
// ==========================================

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    await sequelize.sync({ force: false });
    console.log('✅ All models synchronized successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Project,
  Post,
  Comment,
  Vote,
  Poll,
  PollOption,
  PollVote,
  Release,
  ReleaseFile,
  Changelog,
  CommentVote,
  CommentHistory,
  PostPoll, 
  PostRelease,
  Settings,
  syncDatabase
};