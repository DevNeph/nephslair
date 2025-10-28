const { Comment, Post, User, Project, CommentHistory } = require('../models');

// @desc    Get all comments (Admin only)
// @route   GET /api/comments
// @access  Private/Admin
const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        },
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'title', 'slug'],
          include: [
            {
              model: Project,
              as: 'project',
              attributes: ['id', 'name', 'slug']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get comments for a post
// @route   GET /api/comments/post/:postId
// @access  Public
const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { post_id: req.params.postId },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
  try {
    const { post_id, parent_id, content } = req.body;

    // Validation
    if (!post_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide post_id and content'
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

    const comment = await Comment.create({
      post_id,
      user_id: req.user.id,
      parent_id: parent_id || null,
      content
    });

    // Return comment with user info
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: commentWithUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (Own comment only)
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide content'
      });
    }

    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user owns the comment or is admin
    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    // Save old content to history
    await CommentHistory.create({
      comment_id: comment.id,
      content: comment.content,
      edited_at: new Date()
    });

    // Update comment
    comment.content = content;
    await comment.save();

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get comment edit history
// @route   GET /api/comments/:id/history
// @access  Public
const getCommentHistory = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const history = await CommentHistory.findAll({
      where: { comment_id: req.params.id },
      order: [['edited_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        current: comment.content,
        history: history
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


// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Own comment or Admin)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user owns the comment or is admin
    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Soft delete - sadece is_deleted flag'ini set et
    comment.is_deleted = true;
    comment.content = '[deleted]';
    await comment.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
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
  getAllComments,
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  getCommentHistory 
};
