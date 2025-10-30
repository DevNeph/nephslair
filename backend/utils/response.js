function success(res, data, message = 'Success', status = 200) {
  // 204 No Content: REST standardına göre body olmamalı
  if (status === 204) {
    return res.status(204).send();
  }
  return res.status(status).json({ success: true, data, message });
}
function error(res, message = 'Server error', status = 500, error = null) {
  return res.status(status).json({ success: false, message, error });
}
module.exports = { success, error };
