const { User, Comment, Vote, PollVote } = require('../models');
const { validateFields } = require('../utils/validate');
const { success, error } = require('../utils/response');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    return success(res, users, undefined, 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'email'] } // Don't expose email publicly
    });

    if (!user) {
      return error(res, 'User not found', 404);
    }

    return success(res, user);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validationError = validateFields(req.body, ['role']);
    if (validationError) return error(res, validationError, 400);
    if (!['user', 'admin'].includes(role)) return error(res, 'Please provide valid role (user or admin)', 400);
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);
    user.role = role;
    await user.save();
    return success(res, { id: user.id, username: user.username, role: user.role }, 'User role updated successfully', 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return error(res, 'User not found', 404);
    }

    // Don't allow deleting yourself
    if (user.id === req.user.id) {
      return error(res, 'You cannot delete your own account', 400);
    }

    await user.destroy();

    return success(res, null, 'User deleted successfully', 204);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
};