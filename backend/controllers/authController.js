const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User } = require('../models');
const { success, error } = require('../utils/response');
const { validateFields } = require('../utils/validate');
const { sendMail } = require('../utils/email');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Validation
    const validationError = validateFields(req.body, ['username', 'email', 'password']);
    if (validationError) {
      return error(res, validationError, 400);
    }
    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return error(res, 'User already exists with this email', 400);
    }
    // Check if username is taken
    const usernameExists = await User.findOne({ where: { username } });
    if (usernameExists) {
      return error(res, 'Username is already taken', 400);
    }
    // Create user (password will be hashed automatically by the model hook)
    const user = await User.create({ username, email, password, role: 'user' });
    // Generate token
    const token = generateToken(user.id);
    return success(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    }, 'User registered successfully', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validation
    const validationError = validateFields(req.body, ['email', 'password']);
    if (validationError) {
      return error(res, validationError, 400);
    }
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return error(res, 'Invalid credentials', 401);
    }
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return error(res, 'Invalid credentials', 401);
    }
    // Generate token
    const token = generateToken(user.id);
    return success(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    }, 'Login successful', 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    return success(res, user, undefined, 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

async function forgotPassword(req, res) {
  try {
    const errMsg = validateFields(req.body, ['email']);
    if (errMsg) return error(res, errMsg, 400);

    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Do not reveal
      return success(res, {}, 'If the email exists, a reset link has been sent');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    user.reset_password_token = token;
    user.reset_password_expires_at = expiresAt;
    await user.save();

    const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    try {
      await sendMail({
        to: user.email,
        subject: 'Reset your password',
        html: `<p>Hello ${user.username || ''},</p><p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link will expire in 30 minutes.</p>`,
        text: `Reset your password: ${resetUrl}`
      });
    } catch (_) {
      // Do not fail the flow if mailing fails
    }

    return success(res, {}, 'If the email exists, a reset link has been sent');
  } catch (e) {
    return error(res, 'Failed to process request', 500, e.message);
  }
}

async function resetPassword(req, res) {
  try {
    const errMsg = validateFields(req.body, ['token', 'password']);
    if (errMsg) return error(res, errMsg, 400);

    let { token, password } = req.body;
    token = String(token || '').replace(/[\s'"`]/g, '');

    if (!token || token.length < 32) {
      return error(res, 'Invalid or expired token', 400);
    }

    const candidates = [token, `${token}'`, `${token}"`, `\`${token}\``];
    const user = await User.findOne({ where: { reset_password_token: { [Op.in]: candidates } } });
    if (!user || !user.reset_password_expires_at || new Date(user.reset_password_expires_at) < new Date()) {
      return error(res, 'Invalid or expired token', 400);
    }

    // Assign plain password; model hook will hash on save
    user.password = password;
    user.reset_password_token = null;
    user.reset_password_expires_at = null;
    user.password_changed_at = new Date();
    await user.save();

    return success(res, {}, 'Password reset successfully');
  } catch (e) {
    return error(res, 'Failed to reset password', 500, e.message);
  }
}

async function validateResetToken(req, res) {
  try {
    let token = req.query.token || req.params.token;
    token = String(token || '').replace(/[\s'"`]/g, '');
    if (!token || token.length < 32) return success(res, { valid: false });
    const { Op } = require('sequelize');
    const candidates = [token, `${token}'`, `${token}"`, `\`${token}\``];
    const user = await User.findOne({ where: { reset_password_token: { [Op.in]: candidates } } });
    if (!user || !user.reset_password_expires_at || new Date(user.reset_password_expires_at) < new Date()) {
      return success(res, { valid: false });
    }
    return success(res, { valid: true });
  } catch (e) {
    return success(res, { valid: false });
  }
}

module.exports = {
  register,
  login,
  getMe
};
module.exports.forgotPassword = forgotPassword;
module.exports.resetPassword = resetPassword;
module.exports.validateResetToken = validateResetToken;