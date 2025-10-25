const express = require('express');
const router = express.Router();
const {
  getPoll,
  createPoll,
  votePoll,
  getMyPollVote,
  deletePoll
} = require('../controllers/pollController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

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
 *               - post_id
 *               - question
 *               - options
 *             properties:
 *               post_id:
 *                 type: integer
 *                 example: 1
 *               question:
 *                 type: string
 *                 example: What's your favorite feature?
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