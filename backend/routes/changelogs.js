const express = require('express');
const router = express.Router();
const {
  getChangelogsByProject,
  getAllChangelogsAdmin,
  getChangelogById,
  createChangelog,
  updateChangelog,
  deleteChangelog
} = require('../controllers/changelogController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * /changelogs/project/{projectSlug}:
 *   get:
 *     summary: Get changelogs for a project
 *     tags: [Changelogs]
 *     parameters:
 *       - in: path
 *         name: projectSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Project slug
 *     responses:
 *       200:
 *         description: List of changelogs for the project
 *       404:
 *         description: Project not found
 */
router.get('/project/:projectSlug', getChangelogsByProject);

/**
 * @swagger
 * /changelogs/admin/all:
 *   get:
 *     summary: Get all changelogs (Admin)
 *     tags: [Changelogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all changelogs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/admin/all', auth, adminAuth, getAllChangelogsAdmin);

/**
 * @swagger
 * /changelogs/admin/{id}:
 *   get:
 *     summary: Get single changelog by ID (Admin)
 *     tags: [Changelogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Changelog ID
 *     responses:
 *       200:
 *         description: Changelog details
 *       404:
 *         description: Changelog not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/admin/:id', auth, adminAuth, getChangelogById);

/**
 * @swagger
 * /changelogs:
 *   post:
 *     summary: Create new changelog
 *     tags: [Changelogs]
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
 *               - version
 *             properties:
 *               project_id:
 *                 type: integer
 *                 example: 1
 *               version:
 *                 type: string
 *                 example: "2.01.00"
 *               explanation:
 *                 type: string
 *                 example: "Major update with new features"
 *               release_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-15T00:00:00Z"
 *               content:
 *                 type: string
 *                 description: JSON string of sections and items
 *                 example: '[{"header":"Features","items":["Added dark mode","Improved performance"]}]'
 *     responses:
 *       201:
 *         description: Changelog created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Project not found
 */
router.post('/', auth, adminAuth, createChangelog);

/**
 * @swagger
 * /changelogs/{id}:
 *   put:
 *     summary: Update changelog
 *     tags: [Changelogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Changelog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               version:
 *                 type: string
 *               explanation:
 *                 type: string
 *               release_date:
 *                 type: string
 *                 format: date-time
 *               content:
 *                 type: string
 *                 description: JSON string of sections and items
 *     responses:
 *       200:
 *         description: Changelog updated successfully
 *       404:
 *         description: Changelog not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/:id', auth, adminAuth, updateChangelog);

/**
 * @swagger
 * /changelogs/{id}:
 *   delete:
 *     summary: Delete changelog
 *     tags: [Changelogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Changelog ID
 *     responses:
 *       200:
 *         description: Changelog deleted successfully
 *       404:
 *         description: Changelog not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', auth, adminAuth, deleteChangelog);

module.exports = router;