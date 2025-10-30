const { Comment, Post, User, Project, CommentHistory } = require('../models');
const { validateFields } = require('../utils/validate');
const { success, error } = require('../utils/response');

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
    const validationError = validateFields(req.body, ['post_id', 'content']);
    if (validationError) {
      return error(res, validationError, 400);
    }
    // Check if post exists
    const post = await Post.findByPk(req.body.post_id);
    if (!post) {
      return error(res, 'Post not found', 404);
    }
    const comment = await Comment.create({
      post_id: req.body.post_id,
      user_id: req.user.id,
      parent_id: req.body.parent_id || null,
      content: req.body.content
    });
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }]
    });
    return success(res, commentWithUser, 'Comment created successfully', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (Own comment only)
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return error(res, 'Please provide content', 400);
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return error(res, 'Comment not found', 404);
    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return error(res, 'Not authorized to update this comment', 403);
    }
    await CommentHistory.create({ comment_id: comment.id, content: comment.content, edited_at: new Date() });
    comment.content = content;
    await comment.save();
    return success(res, comment, 'Comment updated successfully', 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
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
