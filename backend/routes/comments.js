const express = require('express');
const router = express.Router();
const {
  getAllComments,
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
  getCommentHistory 
} = require('../controllers/commentController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth')
const { voteComment } = require('../controllers/commentVoteController');
const rateLimit = require('../middleware/rateLimit');

const limitCommentCreate = rateLimit({ windowMs: 60 * 1000, max: 20, keyGenerator: (req) => `${req.ip}:comment-create:${req.body.post_id || ''}` });
const limitCommentVote = rateLimit({ windowMs: 60 * 1000, max: 30, keyGenerator: (req) => `${req.ip}:comment-vote:${req.params.commentId || ''}` });

// Get all comments (Admin only)
router.get('/', auth, adminAuth, getAllComments);

/**
 * @swagger
 * /comments/post/{postId}:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/post/:postId', getCommentsByPost);

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create comment
 *     tags: [Comments]
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
 *               - content
 *             properties:
 *               post_id:
 *                 type: integer
 *                 example: 1
 *               content:
 *                 type: string
 *                 example: Great post! Thanks for sharing.
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many requests
 */
router.post('/', auth, limitCommentCreate, createComment);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update own comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Updated comment text
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Comment not found
 */
router.put('/:id', auth, updateComment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete own comment (or any as admin)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Comment not found
 */
router.delete('/:id', auth, deleteComment);

/**
 * @swagger
 * /comments/{commentId}/vote:
 *   post:
 *     summary: Vote on a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vote_type
 *             properties:
 *               vote_type:
 *                 type: string
 *                 enum: [upvote, downvote]
 *     responses:
 *       200:
 *         description: Vote recorded/updated/removed
 *       429:
 *         description: Too many requests
 */
router.post('/:commentId/vote', auth, limitCommentVote, voteComment);
router.get('/:id/history', getCommentHistory);

module.exports = router;