const express = require('express');
const router = express.Router();
const {
  votePost,
  getUserVote
} = require('../controllers/voteController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /votes:
 *   post:
 *     summary: Vote on a post (upvote/downvote)
 *     tags: [Votes]
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
 *               - vote_type
 *             properties:
 *               post_id:
 *                 type: integer
 *                 example: 1
 *               vote_type:
 *                 type: string
 *                 enum: [upvote, downvote]
 *                 example: upvote
 *     responses:
 *       201:
 *         description: Vote created successfully
 *       200:
 *         description: Vote updated or removed
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, votePost);

/**
 * @swagger
 * /votes/post/{postId}:
 *   get:
 *     summary: Get user's vote for a post
 *     tags: [Votes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: User's vote status
 *       401:
 *         description: Unauthorized
 */
router.get('/post/:postId', auth, getUserVote);

module.exports = router;