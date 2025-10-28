const { CommentVote, Comment } = require('../models');

// @desc    Vote on a comment (upvote/downvote)
// @route   POST /api/comments/:commentId/vote
// @access  Private
const voteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { vote_type } = req.body; // 'upvote' or 'downvote'
    
    if (!vote_type || !['upvote', 'downvote'].includes(vote_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type. Must be "upvote" or "downvote"'
      });
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

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
        
        return res.status(200).json({
          success: true,
          message: 'Vote removed',
          data: {
            upvotes: comment.upvotes,
            downvotes: comment.downvotes
          }
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
      
      return res.status(200).json({
        success: true,
        message: 'Vote updated',
        data: {
          upvotes: comment.upvotes,
          downvotes: comment.downvotes
        }
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
    
    res.status(200).json({
      success: true,
      message: 'Vote recorded',
      data: {
        upvotes: comment.upvotes,
        downvotes: comment.downvotes
      }
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
  voteComment
};