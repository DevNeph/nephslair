const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getAllPostsAdmin,
  getPostsByProject,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  updatePostStatus,
  deletePost,
  votePost,
  addPollToPost,
  removePollFromPost,
  addDownloadToPost,
  removeDownloadFromPost,
  addReleaseToPost,
  removeReleaseFromPost
} = require('../controllers/postController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const rateLimit = require('../middleware/rateLimit');

const limitVotes = rateLimit({ windowMs: 60 * 1000, max: 30, keyGenerator: (req) => `${req.ip}:post-vote:${req.params.id || ''}` });

// Public routes
router.get('/', getAllPosts);
router.get('/project/:slug', getPostsByProject);
router.get('/:slug', getPostBySlug);

// Admin routes
router.get('/admin/all', auth, adminAuth, getAllPostsAdmin);
router.get('/admin/:id', auth, adminAuth, getPostById);
router.post('/', auth, adminAuth, createPost);
router.put('/:id', auth, adminAuth, updatePost);
router.patch('/:id', auth, adminAuth, updatePostStatus);
router.delete('/:id', auth, adminAuth, deletePost);

/**
 * @swagger
 * /posts/{id}/vote:
 *   post:
 *     summary: Vote on post (upvote/downvote)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Vote registered/updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many requests
 */
router.post('/:id/vote', auth, limitVotes, votePost);

// Poll management
router.post('/:postId/polls/:pollId', auth, adminAuth, addPollToPost);
router.delete('/:postId/polls/:pollId', auth, adminAuth, removePollFromPost);

// Download management
router.post('/:postId/downloads/:fileId', auth, adminAuth, addDownloadToPost);
router.delete('/:postId/downloads/:fileId', auth, adminAuth, removeDownloadFromPost);

// Release management
router.post('/:postId/releases/:releaseId', auth, adminAuth, addReleaseToPost);
router.delete('/:postId/releases/:releaseId', auth, adminAuth, removeReleaseFromPost);

module.exports = router;