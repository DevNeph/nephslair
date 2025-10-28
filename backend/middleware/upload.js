const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure downloads directory exists
const downloadDir = path.join(__dirname, '../downloads');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, downloadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    cb(null, sanitizedName + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-tar',
    'application/gzip',
    'application/x-7z-compressed',
    'application/octet-stream',
    'application/x-msdownload', // .exe
    'application/x-apple-diskimage', // .dmg
    'application/pdf',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(zip|rar|tar|gz|7z|exe|dmg|pdf|txt|deb|rpm|pkg|appimage)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only archive and executable files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max file size
  }
});

module.exports = upload;