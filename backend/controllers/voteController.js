const { Vote, Post } = require('../models');
const { Op } = require('sequelize');

// @desc    Vote on a post (upvote/downvote)
// @route   POST /api/votes
// @access  Private
const votePost = async (req, res) => {
  try {
    const { post_id, vote_type } = req.body;

    // Validation
    if (!post_id || !vote_type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide post_id and vote_type'
      });
    }

    if (!['upvote', 'downvote'].includes(vote_type)) {
      return res.status(400).json({
        success: false,
        message: 'vote_type must be either upvote or downvote'
      });
    }

    // Check if post exists
    const post = await Post.findByPk(post_id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
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

        return res.status(200).json({
          success: true,
          message: 'Vote removed',
          data: { post_id, vote_type: null, upvotes: post.upvotes, downvotes: post.downvotes }
        });
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

      return res.status(200).json({
        success: true,
        message: 'Vote updated',
        data: { post_id, vote_type, upvotes: post.upvotes, downvotes: post.downvotes }
      });
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

    res.status(201).json({
      success: true,
      message: 'Vote created successfully',
      data: { post_id, vote_type, upvotes: post.upvotes, downvotes: post.downvotes }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
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
      return res.status(200).json({
        success: true,
        data: { vote_type: null }
      });
    }

    res.status(200).json({
      success: true,
      data: { vote_type: vote.vote_type }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  votePost,
  getUserVote
};