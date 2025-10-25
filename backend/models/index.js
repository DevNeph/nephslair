const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Post = require('./Post');
const Comment = require('./Comment');
const Vote = require('./Vote');
const Poll = require('./Poll');
const PollOption = require('./PollOption');
const PollVote = require('./PollVote');
const Download = require('./Download');

// Define relationships

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

// Post - Vote relationship
Post.hasMany(Vote, { foreignKey: 'post_id', as: 'votes' });
Vote.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// User - Vote relationship
User.hasMany(Vote, { foreignKey: 'user_id', as: 'votes' });
Vote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Post - Poll relationship
Post.hasMany(Poll, { foreignKey: 'post_id', as: 'polls' });
Poll.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// Poll - PollOption relationship
Poll.hasMany(PollOption, { foreignKey: 'poll_id', as: 'options' });
PollOption.belongsTo(Poll, { foreignKey: 'poll_id', as: 'poll' });

// PollOption - PollVote relationship
PollOption.hasMany(PollVote, { foreignKey: 'poll_option_id', as: 'votes' });
PollVote.belongsTo(PollOption, { foreignKey: 'poll_option_id', as: 'option' });

// User - PollVote relationship
User.hasMany(PollVote, { foreignKey: 'user_id', as: 'pollVotes' });
PollVote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Project - Download relationship
Project.hasMany(Download, { foreignKey: 'project_id', as: 'downloads' });
Download.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Database sync function
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Use force: true to drop and recreate tables (ONLY for development!)
    await sequelize.sync({ force: false }); // Changed from alter to force
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
  Download,
  syncDatabase
};