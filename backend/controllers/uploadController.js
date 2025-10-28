const path = require('path');

// @desc    Upload release file
// @route   POST /api/upload/release-file
// @access  Private/Admin
const uploadReleaseFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get file information
    const file = req.file;
    
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/downloads/${file.filename}`;
    
    // Get file extension
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        file_name: file.originalname,
        file_url: fileUrl,
        file_size: file.size,
        file_type: ext,
        server_filename: file.filename
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload/release-file/:filename
// @access  Private/Admin
const deleteUploadedFile = async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../downloads', filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
};

module.exports = {
  uploadReleaseFile,
  deleteUploadedFile
};