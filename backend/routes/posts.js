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
  deletePost
} = require('../controllers/postController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all published posts (homepage feed)
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of published posts
 */
router.get('/', getAllPosts);

/**
 * @swagger
 * /posts/admin/all:
 *   get:
 *     summary: Get all posts including drafts (Admin only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all posts
 */
router.get('/admin/all', auth, adminAuth, getAllPostsAdmin);


/**
 * @swagger
 * /posts/admin/{id}:
 *   get:
 *     summary: Get post by ID (Admin only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get('/admin/:id', auth, adminAuth, getPostById);

/**
 * @swagger
 * /posts/project/{slug}:
 *   get:
 *     summary: Get posts by project slug
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Project slug
 *     responses:
 *       200:
 *         description: List of posts from project
 *       404:
 *         description: Project not found
 */
router.get('/project/:slug', getPostsByProject);

/**
 * @swagger
 * /posts/{slug}:
 *   get:
 *     summary: Get single post by slug
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Post slug
 *     responses:
 *       200:
 *         description: Post details with comments and polls
 *       404:
 *         description: Post not found
 */
router.get('/:slug', getPostBySlug);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create new post
 *     tags: [Posts]
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
 *               - content
 *             properties:
 *               project_id:
 *                 type: integer
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: Version 2.0 Released!
 *               content:
 *                 type: string
 *                 example: We are excited to announce version 2.0...
 *               excerpt:
 *                 type: string
 *                 example: Brief summary of the post
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 example: published
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/', auth, adminAuth, createPost);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.put('/:id', auth, adminAuth, updatePost);

/**
 * @swagger
 * /posts/{id}:
 *   patch:
 *     summary: Update post status (Admin only)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 example: published
 *     responses:
 *       200:
 *         description: Post status updated successfully
 *       404:
 *         description: Post not found
 */
router.patch('/:id', auth, adminAuth, updatePostStatus);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.delete('/:id', auth, adminAuth, deletePost);

module.exports = router;