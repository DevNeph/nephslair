const express = require('express');
const router = express.Router();
const {
  getDownloadsByProject,
  getDownload,
  getAllDownloadsAdmin,
  getDownloadById,
  createDownload,
  updateDownload,
  incrementDownloadCount,
  deleteDownload
} = require('../controllers/downloadController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * /downloads/project/{projectSlug}:
 *   get:
 *     summary: Get downloads for a project
 *     tags: [Downloads]
 *     parameters:
 *       - in: path
 *         name: projectSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Project slug
 *     responses:
 *       200:
 *         description: List of downloads for the project
 *       404:
 *         description: Project not found
 */
router.get('/project/:projectSlug', getDownloadsByProject);

/**
 * @swagger
 * /downloads/admin/all:
 *   get:
 *     summary: Get all downloads (Admin)
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all downloads
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/admin/all', auth, adminAuth, getAllDownloadsAdmin);

/**
 * @swagger
 * /downloads/admin/{id}:
 *   get:
 *     summary: Get single download by ID (Admin)
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Download ID
 *     responses:
 *       200:
 *         description: Download details
 *       404:
 *         description: Download not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/admin/:id', auth, adminAuth, getDownloadById);

/**
 * @swagger
 * /downloads/{id}:
 *   get:
 *     summary: Get single download
 *     tags: [Downloads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Download ID
 *     responses:
 *       200:
 *         description: Download details
 *       404:
 *         description: Download not found
 */
router.get('/:id', getDownload);

/**
 * @swagger
 * /downloads:
 *   post:
 *     summary: Create download
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_id
 *               - title
 *               - file_url
 *             properties:
 *               project_id:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: MyApp-v2.0.1.zip
 *               file_url:
 *                 type: string
 *                 example: https://cdn.example.com/files/myapp-v2.0.1.zip
 *               version:
 *                 type: string
 *                 example: v2.0.1
 *               description:
 *                 type: string
 *                 example: Latest stable release with bug fixes
 *               file_size:
 *                 type: integer
 *                 example: 25400000
 *                 description: File size in bytes
 *               file_type:
 *                 type: string
 *                 example: zip
 *     responses:
 *       201:
 *         description: Download created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/', auth, adminAuth, createDownload);

/**
 * @swagger
 * /downloads/{id}:
 *   put:
 *     summary: Update download
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Download ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               file_url:
 *                 type: string
 *               version:
 *                 type: string
 *               description:
 *                 type: string
 *               file_size:
 *                 type: integer
 *               file_type:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Download updated successfully
 *       404:
 *         description: Download not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/:id', auth, adminAuth, updateDownload);

/**
 * @swagger
 * /downloads/{id}/increment:
 *   post:
 *     summary: Increment download count
 *     tags: [Downloads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Download ID
 *     responses:
 *       200:
 *         description: Download count incremented
 *       404:
 *         description: Download not found
 */
router.post('/:id/increment', incrementDownloadCount);

/**
 * @swagger
 * /downloads/{id}:
 *   delete:
 *     summary: Delete download
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Download ID
 *     responses:
 *       200:
 *         description: Download deleted successfully
 *       404:
 *         description: Download not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', auth, adminAuth, deleteDownload);

// ... diğer route'lar ...

/**
 * @swagger
 * /releases/download/{fileId}:
 *   get:
 *     summary: Download release file
 *     tags: [Releases]
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: File download
 *       404:
 *         description: File not found
 */
router.get('/download/:fileId', downloadFile);

module.exports = router;