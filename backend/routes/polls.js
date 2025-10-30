const express = require('express');
const router = express.Router();
const {
  getPoll,
  getPollsByProject,
  getPollsByPost,
  getStandalonePolls,
  getAvailablePolls,
  createPoll,
  updatePoll, // ← EKLE
  votePoll,
  getMyPollVote,
  getAllPolls,
  togglePollStatus,
  finalizePoll,
  deletePoll
} = require('../controllers/pollController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * /polls/admin/all:
 *   get:
 *     summary: Get all polls (Admin)
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all polls
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/admin/all', auth, adminAuth, getAllPolls);

/**
 * @swagger
 * /polls/standalone:
 *   get:
 *     summary: Get standalone polls (for homepage)
 *     tags: [Polls]
 *     responses:
 *       200:
 *         description: List of standalone polls
 */
router.get('/standalone', getStandalonePolls);

/**
 * @swagger
 * /polls/available:
 *   get:
 *     summary: Get all standalone polls (for post editor)
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available polls
 */
router.get('/available', auth, adminAuth, getAvailablePolls);

/**
 * @swagger
 * /polls/project/{projectIdOrSlug}:
 *   get:
 *     summary: Get polls by project (ID or slug)
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: projectIdOrSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID or slug
 *     responses:
 *       200:
 *         description: List of polls for the project
 *       404:
 *         description: Project not found
 */
router.get('/project/:projectIdOrSlug', getPollsByProject);

/**
 * @swagger
 * /polls/post/{postId}:
 *   get:
 *     summary: Get polls by post
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: List of polls for the post
 */
router.get('/post/:postId', getPollsByPost);

/**
 * @swagger
 * /polls/{id}/my-vote:
 *   get:
 *     summary: Get user's vote for a poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *     responses:
 *       200:
 *         description: User's vote status
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/my-vote', auth, getMyPollVote);

/**
 * @swagger
 * /polls/{id}:
 *   get:
 *     summary: Get poll with options and vote counts
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *     responses:
 *       200:
 *         description: Poll details
 *       404:
 *         description: Poll not found
 */
router.get('/:id', getPoll);

/**
 * @swagger
 * /polls:
 *   post:
 *     summary: Create poll with options
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - options
 *             properties:
 *               project_id:
 *                 type: integer
 *                 example: 1
 *               question:
 *                 type: string
 *                 example: What's your favorite feature?
 *               show_on_homepage:
 *                 type: boolean
 *                 example: false
 *               is_standalone:
 *                 type: boolean
 *                 example: true
 *               is_active:
 *                 type: boolean
 *                 example: true
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-31T23:59:59Z
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Feature A", "Feature B", "Feature C"]
 *     responses:
 *       201:
 *         description: Poll created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/', auth, adminAuth, createPoll);

/**
 * @swagger
 * /polls/{id}/vote:
 *   post:
 *     summary: Vote on poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - poll_option_id
 *             properties:
 *               poll_option_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Vote created successfully
 *       200:
 *         description: Vote updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/vote', auth, votePoll);

/**
 * @swagger
 * /polls/{id}/toggle:
 *   patch:
 *     summary: Toggle poll active status
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_active
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Poll status updated successfully
 *       404:
 *         description: Poll not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.patch('/:id/toggle', auth, adminAuth, togglePollStatus);

/**
 * @swagger
 * /polls/{id}/finalize:
 *   patch:
 *     summary: Finalize poll (cannot be reopened)
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *     responses:
 *       200:
 *         description: Poll finalized successfully
 *       400:
 *         description: Poll is already finalized
 *       404:
 *         description: Poll not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.patch('/:id/finalize', auth, adminAuth, finalizePoll);

/**
 * @swagger
 * /polls/{id}:
 *   put:
 *     summary: Update poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - options
 *             properties:
 *               project_id:
 *                 type: integer
 *                 example: 1
 *               question:
 *                 type: string
 *                 example: What's your favorite feature?
 *               show_on_homepage:
 *                 type: boolean
 *                 example: false
 *               is_standalone:
 *                 type: boolean
 *                 example: true
 *               is_active:
 *                 type: boolean
 *                 example: true
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-31T23:59:59Z
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Feature A", "Feature B", "Feature C"]
 *     responses:
 *       200:
 *         description: Poll updated successfully
 *       404:
 *         description: Poll not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/:id', auth, adminAuth, updatePoll);

/**
 * @swagger
 * /polls/{id}:
 *   delete:
 *     summary: Delete poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *     responses:
 *       200:
 *         description: Poll deleted successfully
 *       404:
 *         description: Poll not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', auth, adminAuth, deletePoll);

module.exports = router;