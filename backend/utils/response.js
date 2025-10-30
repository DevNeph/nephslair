function success(res, data, message = 'Success', status = 200) {
  return res.status(status).json({ success: true, data, message });
}
function error(res, message = 'Server error', status = 500, error = null) {
  return res.status(status).json({ success: false, message, error });
}
module.exports = { success, error };
