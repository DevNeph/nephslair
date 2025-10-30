const { CommentVote, Comment } = require('../models');
const { validateFields } = require('../utils/validate');
const { success, error } = require('../utils/response');

// @desc    Vote on a comment (upvote/downvote)
// @route   POST /api/comments/:commentId/vote
// @access  Private
const voteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { vote_type } = req.body; // 'upvote' or 'downvote'
    const validationError = validateFields(req.body, ['vote_type']);
    if (validationError || !['upvote', 'downvote'].includes(vote_type)) {
      return error(res, 'Invalid vote type. Must be "upvote" or "downvote"', 400);
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) return error(res, 'Comment not found', 404);

    // Check if user already voted
    const existingVote = await CommentVote.findOne({
      where: {
        user_id: req.user.id,
        comment_id: commentId
      }
    });

    if (existingVote) {
      // Same vote = remove vote
      if (existingVote.vote_type === vote_type) {
        await existingVote.destroy();
        
        // Update comment vote count
        if (vote_type === 'upvote') {
          comment.upvotes = Math.max(0, comment.upvotes - 1);
        } else {
          comment.downvotes = Math.max(0, comment.downvotes - 1);
        }
        await comment.save();
        
        return success(res, 'Vote removed', {
          upvotes: comment.upvotes,
          downvotes: comment.downvotes
        });
      }
      
      // Different vote = change vote
      const oldVote = existingVote.vote_type;
      existingVote.vote_type = vote_type;
      await existingVote.save();
      
      // Update comment vote counts
      if (oldVote === 'upvote') {
        comment.upvotes = Math.max(0, comment.upvotes - 1);
        comment.downvotes += 1;
      } else {
        comment.downvotes = Math.max(0, comment.downvotes - 1);
        comment.upvotes += 1;
      }
      await comment.save();
      
      return success(res, 'Vote updated', {
        upvotes: comment.upvotes,
        downvotes: comment.downvotes
      });
    }

    // New vote
    await CommentVote.create({
      user_id: req.user.id,
      comment_id: commentId,
      vote_type
    });
    
    // Update comment vote count
    if (vote_type === 'upvote') {
      comment.upvotes += 1;
    } else {
      comment.downvotes += 1;
    }
    await comment.save();
    
    return success(res, 'Vote recorded', {
      upvotes: comment.upvotes,
      downvotes: comment.downvotes
    });
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = {
  voteComment
};