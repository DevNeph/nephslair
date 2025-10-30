const path = require('path');
const fs = require('fs');

function buildDownloadUrl(req, filename) {
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/downloads/${filename}`;
}

function getDownloadsPath() {
  return path.join(__dirname, '../downloads');
}

function deletePhysicalDownload(filename) {
  if (!filename) return false;
  const filePath = path.join(getDownloadsPath(), filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

module.exports = { buildDownloadUrl, deletePhysicalDownload, getDownloadsPath };
