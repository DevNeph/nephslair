const express = require('express');
const router = express.Router();
const {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const auth = require('../middleware/auth');

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
 */
router.post('/', auth, createComment);

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

module.exports = router;