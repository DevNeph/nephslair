const path = require('path');
const { success, error } = require('../utils/response');
const { buildDownloadUrl, deletePhysicalDownload } = require('../utils/files');

// @desc    Upload release file
// @route   POST /api/upload/release-file
// @access  Private/Admin
const uploadReleaseFile = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, 'No file uploaded', 400);
    }

    const file = req.file;
    const fileUrl = buildDownloadUrl(req, file.filename);
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

    return success(res, {
      file_name: file.originalname,
      file_url: fileUrl,
      file_size: file.size,
      file_type: ext,
      server_filename: file.filename
    }, 'File uploaded successfully', 200);
  } catch (err) {
    return error(res, 'Error uploading file', 500, err.message);
  }
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload/release-file/:filename
// @access  Private/Admin
const deleteUploadedFile = async (req, res) => {
  try {
    const filename = req.params.filename;
    const deleted = deletePhysicalDownload(filename);
    if (deleted) {
      return success(res, null, 'File deleted successfully', 200);
    }
    return error(res, 'File not found', 404);
  } catch (err) {
    return error(res, 'Error deleting file', 500, err.message);
  }
};

module.exports = {
  uploadReleaseFile,
  deleteUploadedFile
};