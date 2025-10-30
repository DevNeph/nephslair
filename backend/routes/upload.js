const express = require('express');
const router = express.Router();
const { uploadReleaseFile, deleteUploadedFile } = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const rateLimit = require('../middleware/rateLimit');

const limitUpload = rateLimit({ windowMs: 60 * 1000, max: 5, keyGenerator: (req) => `${req.ip}:upload` });

/**
 * @swagger
 * /upload/release-file:
 *   post:
 *     summary: Upload release file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       429:
 *         description: Too many requests
 */
router.post('/release-file', auth, adminAuth, limitUpload, upload.single('file'), uploadReleaseFile);

/**
 * @swagger
 * /upload/release-file/{filename}:
 *   delete:
 *     summary: Delete uploaded file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/release-file/:filename', auth, adminAuth, deleteUploadedFile);

module.exports = router;