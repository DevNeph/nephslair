const express = require('express');
const router = express.Router();
const {
  getReleasesByProject,
  getAllReleasesAdmin,
  getReleasesByProjectIdAdmin,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease,
  addFileToRelease,
  updateReleaseFile,
  deleteReleaseFile,
  incrementDownloadCount,
  downloadFile
} = require('../controllers/releaseController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Public routes
router.get('/project/:projectSlug', getReleasesByProject);
router.get('/download/:fileId', downloadFile);
router.post('/files/:fileId/download', incrementDownloadCount);

// Admin routes
router.get('/admin/all', auth, adminAuth, getAllReleasesAdmin);
router.get('/admin/project/:projectId', auth, adminAuth, getReleasesByProjectIdAdmin);
router.get('/admin/:id', auth, adminAuth, getReleaseById);
router.post('/', auth, adminAuth, createRelease);
router.put('/:id', auth, adminAuth, updateRelease);
router.delete('/:id', auth, adminAuth, deleteRelease);

// File management
router.post('/:id/files', auth, adminAuth, addFileToRelease);
router.put('/files/:fileId', auth, adminAuth, updateReleaseFile);
router.delete('/files/:fileId', auth, adminAuth, deleteReleaseFile);

module.exports = router;