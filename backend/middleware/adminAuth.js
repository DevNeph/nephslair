const { error } = require('../utils/response');

const adminAuth = (req, res, next) => {
  try {
    if (!req.user) {
      return error(res, 'Authentication required', 401);
    }

    if (req.user.role !== 'admin') {
      return error(res, 'Access denied. Admin privileges required.', 403);
    }

    next();
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = adminAuth;