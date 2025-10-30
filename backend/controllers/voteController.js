const { Vote, Post } = require('../models');
const { Op } = require('sequelize');
const { validateFields } = require('../utils/validate');
const { success, error } = require('../utils/response');

// @desc    Vote on a post (upvote/downvote)
// @route   POST /api/votes
// @access  Private
const votePost = async (req, res) => {
  try {
    const { post_id, vote_type } = req.body;
    const validationError = validateFields(req.body, ['post_id', 'vote_type']);
    if (validationError) return error(res, validationError, 400);

    if (!['upvote', 'downvote'].includes(vote_type)) {
      return error(res, 'vote_type must be either upvote or downvote', 400);
    }

    // Check if post exists
    const post = await Post.findByPk(post_id);
    if (!post) {
      return error(res, 'Post not found', 404);
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      where: {
        post_id,
        user_id: req.user.id
      }
    });

    if (existingVote) {
      // If same vote type, remove vote (toggle off)
      if (existingVote.vote_type === vote_type) {
        await existingVote.destroy();

        // Update post vote counts
        if (vote_type === 'upvote') {
          post.upvotes = Math.max(0, post.upvotes - 1);
        } else {
          post.downvotes = Math.max(0, post.downvotes - 1);
        }
        await post.save();

        return success(res, 'Vote removed', { post_id, vote_type: null, upvotes: post.upvotes, downvotes: post.downvotes });
      }

      // If different vote type, update vote
      const oldVoteType = existingVote.vote_type;
      existingVote.vote_type = vote_type;
      await existingVote.save();

      // Update post vote counts
      if (oldVoteType === 'upvote') {
        post.upvotes = Math.max(0, post.upvotes - 1);
        post.downvotes += 1;
      } else {
        post.downvotes = Math.max(0, post.downvotes - 1);
        post.upvotes += 1;
      }
      await post.save();

      return success(res, 'Vote updated', { post_id, vote_type, upvotes: post.upvotes, downvotes: post.downvotes });
    }

    // Create new vote
    const vote = await Vote.create({
      post_id,
      user_id: req.user.id,
      vote_type
    });

    // Update post vote counts
    if (vote_type === 'upvote') {
      post.upvotes += 1;
    } else {
      post.downvotes += 1;
    }
    await post.save();

    return success(res, 'Vote created successfully', { post_id, vote_type, upvotes: post.upvotes, downvotes: post.downvotes });
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Get user's vote for a post
// @route   GET /api/votes/post/:postId
// @access  Private
const getUserVote = async (req, res) => {
  try {
    const vote = await Vote.findOne({
      where: {
        post_id: req.params.postId,
        user_id: req.user.id
      }
    });

    if (!vote) {
      return success(res, 'Vote not found', { vote_type: null });
    }

    return success(res, 'Vote found', { vote_type: vote.vote_type });
  } catch (error) {
    return error(res, 'Server error', 500, error.message);
  }
};

module.exports = {
  votePost,
  getUserVote
};