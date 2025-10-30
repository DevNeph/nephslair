const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { error } = require('../utils/response');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return error(res, 'No authentication token, access denied', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return error(res, 'User not found', 401);
    }

    // Invalidate token if password has been changed after token issuance
    if (user.password_changed_at) {
      const changedAt = new Date(user.password_changed_at).getTime();
      const issuedAt = (decoded.iat || 0) * 1000;
      if (issuedAt < changedAt) {
        return error(res, 'Token invalid after password change', 401);
      }
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Invalid token', 401);
    }
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired', 401);
    }
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = auth;