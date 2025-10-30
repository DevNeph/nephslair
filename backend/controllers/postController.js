const { Post, User, Project, Comment, Poll, PollOption, Vote, Release, ReleaseFile, Changelog, PostPoll, PostDownload, PostRelease, sequelize } = require('../models');
const { validateFields } = require('../utils/validate');
const { success, error } = require('../utils/response');

// @desc    Get all published posts (for homepage)
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { status: 'published' },
      order: [['published_at', 'DESC']],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM comments
              WHERE comments.post_id = Post.id
            )`),
            'comments_count'
          ]
        ]
      },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get posts by project slug
// @route   GET /api/posts/project/:slug
// @access  Public
const getPostsByProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { slug: req.params.slug, status: 'published' }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const posts = await Post.findAll({
      where: {
        project_id: project.id,
        status: 'published'
      },
      order: [['published_at', 'DESC']],
      attributes: {
        include: [
          [
            sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.post_id = Post.id)'),
            'comments_count'
          ]
        ]
      },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
// @access  Public
const getPostBySlug = async (req, res) => {
  try {
    const userId = req.user?.id; // ✅ User ID'sini al

    const post = await Post.findOne({
      where: { slug: req.params.slug },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'slug', 'description', 'status', 'latest_version', 'updated_at'],
          include: [
            {
              model: Release,
              as: 'releases',
              attributes: ['id', 'version', 'release_date', 'is_published'],
              where: { is_published: true },
              required: false,
              separate: true,
              order: [['release_date', 'DESC']],
              limit: 1
            },
            {
              model: Changelog,
              as: 'changelogs',
              required: false,
              separate: true,
              order: [['release_date', 'DESC']],
              limit: 5
            }
          ]
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email', 'role']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'role']
            }
          ],
          separate: true,
          order: [['created_at', 'DESC']]
        },
        {
          model: Poll,
          as: 'attachedPolls',
          through: { 
            model: PostPoll,
            attributes: ['display_order']
          },
          include: [
            {
              model: PollOption,
              as: 'options',
              attributes: ['id', 'option_text', 'votes_count']
            }
          ]
        },
        {
          model: Release,
          as: 'attachedReleases',
          through: { 
            model: PostRelease,
            attributes: ['display_order']
          },
          include: [
            {
              model: ReleaseFile,
              as: 'files'
            }
          ]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // ✅ Format poll options
    const postData = post.toJSON();
    
    if (postData.attachedPolls && postData.attachedPolls.length > 0) {
      const { formatPollOptions } = require('./pollController');
      
      postData.attachedPolls = await Promise.all(
        postData.attachedPolls.map(async (poll) => {
          const now = new Date();
          const isClosed = poll.is_finalized || 
                          !poll.is_active || 
                          (poll.end_date && new Date(poll.end_date) < now);
          
          return {
            ...poll,
            options: await formatPollOptions(poll.options, userId),
            is_closed: isClosed
          };
        })
      );
    }

    res.status(200).json({
      success: true,
      data: postData
    });
  } catch (error) {
    console.error('❌ Error in getPostBySlug:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get post by ID (Admin)
// @route   GET /api/posts/admin/:id
// @access  Private/Admin
const getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all posts (Admin - including drafts)
// @route   GET /api/posts/admin/all
// @access  Private/Admin
const getAllPostsAdmin = async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }
      ],
      attributes: ['id', 'title', 'slug', 'content', 'excerpt', 'project_id', 'status', 'upvotes', 'downvotes', 'published_at', 'created_at', 'updated_at']
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private/Admin
const createPost = async (req, res) => {
  try {
    const { project_id, title, content, excerpt, status } = req.body;
    const validationError = validateFields(req.body, ['title', 'content']);
    if (validationError) {
      return error(res, validationError, 400);
    }
    const slug = title
      .toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    if (project_id) {
      const project = await Project.findByPk(project_id);
      if (!project) return error(res, 'Project not found', 404);
    }
    const slugExists = await Post.findOne({ where: { slug } });
    if (slugExists) {
      return error(res, 'Slug already exists. Please use a different title.', 400);
    }
    const post = await Post.create({
      project_id: project_id || null, 
      author_id: req.user.id,
      title,
      slug,
      content,
      excerpt,
      status: status || 'draft',
      published_at: status === 'published' ? new Date() : null
    });
    return success(res, post, 'Post created successfully', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private/Admin
const updatePost = async (req, res) => {
  try {
    const { title, slug, content, excerpt, status } = req.body;
    const post = await Post.findByPk(req.params.id);
    if (!post) return error(res, 'Post not found', 404);
    if (slug && slug !== post.slug) {
      const slugExists = await Post.findOne({ where: { slug } });
      if (slugExists && slugExists.id !== post.id) {
        return error(res, 'Slug already exists', 400);
      }
    }
    if (title) post.title = title;
    if (slug) post.slug = slug;
    if (content) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (status) {
      post.status = status;
      if (status === 'published' && !post.published_at) {
        post.published_at = new Date();
      }
    }
    await post.save();
    return success(res, post, 'Post updated successfully', 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Update post status
// @route   PATCH /api/posts/:id
// @access  Private/Admin
const updatePostStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const post = await Post.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    post.status = status;
    if (status === 'published' && !post.published_at) {
      post.published_at = new Date();
    }
    
    await post.save();
    
    res.status(200).json({
      success: true,
      message: 'Post status updated',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private/Admin
const deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.destroy();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Vote on post
// @route   POST /api/posts/:id/vote
// @access  Private
const votePost = async (req, res) => {
  try {
    const { vote_type } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;

    if (!vote_type || !['upvote', 'downvote'].includes(vote_type)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid vote_type (upvote or downvote)'
      });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    let vote = await Vote.findOne({
      where: {
        user_id: userId,
        post_id: postId
      }
    });

    if (vote) {
      if (vote.vote_type === vote_type) {
        await vote.destroy();
        
        if (vote_type === 'upvote') {
          post.upvotes = Math.max(0, post.upvotes - 1);
        } else {
          post.downvotes = Math.max(0, post.downvotes - 1);
        }
      } else {
        vote.vote_type = vote_type;
        await vote.save();
        
        if (vote_type === 'upvote') {
          post.upvotes += 1;
          post.downvotes = Math.max(0, post.downvotes - 1);
        } else {
          post.downvotes += 1;
          post.upvotes = Math.max(0, post.upvotes - 1);
        }
      }
    } else {
      await Vote.create({
        user_id: userId,
        post_id: postId,
        vote_type: vote_type
      });
      
      if (vote_type === 'upvote') {
        post.upvotes += 1;
      } else {
        post.downvotes += 1;
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        upvotes: post.upvotes,
        downvotes: post.downvotes
      }
    });
  } catch (error) {
    console.error('Error voting on post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ==========================================
// ✅ NEW FUNCTIONS - POLL MANAGEMENT
// ==========================================

// @desc    Add poll to post
// @route   POST /api/posts/:postId/polls/:pollId
// @access  Private/Admin
const addPollToPost = async (req, res) => {
  try {
    const { postId, pollId } = req.params;
    const { display_order } = req.body;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const poll = await Poll.findByPk(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Check if already exists
    const existing = await PostPoll.findOne({
      where: { post_id: postId, poll_id: pollId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Poll already attached to this post'
      });
    }

    await PostPoll.create({
      post_id: postId,
      poll_id: pollId,
      display_order: display_order || 0
    });

    res.status(201).json({
      success: true,
      message: 'Poll added to post successfully'
    });
  } catch (error) {
    console.error('Error adding poll to post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Remove poll from post
// @route   DELETE /api/posts/:postId/polls/:pollId
// @access  Private/Admin
const removePollFromPost = async (req, res) => {
  try {
    const { postId, pollId } = req.params;

    const postPoll = await PostPoll.findOne({
      where: { post_id: postId, poll_id: pollId }
    });

    if (!postPoll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not attached to this post'
      });
    }

    await postPoll.destroy();

    res.status(200).json({
      success: true,
      message: 'Poll removed from post successfully'
    });
  } catch (error) {
    console.error('Error removing poll from post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// @desc    Add download file to post
// @route   POST /api/posts/:postId/downloads/:fileId
// @access  Private/Admin
const addDownloadToPost = async (req, res) => {
  try {
    const { postId, fileId } = req.params;
    const { display_order } = req.body;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const file = await ReleaseFile.findByPk(fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Release file not found'
      });
    }

    // Check if already exists
    const existing = await PostDownload.findOne({
      where: { post_id: postId, release_file_id: fileId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'File already attached to this post'
      });
    }

    await PostDownload.create({
      post_id: postId,
      release_file_id: fileId,
      display_order: display_order || 0
    });

    res.status(201).json({
      success: true,
      message: 'Download file added to post successfully'
    });
  } catch (error) {
    console.error('Error adding download to post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Remove download file from post
// @route   DELETE /api/posts/:postId/downloads/:fileId
// @access  Private/Admin
const removeDownloadFromPost = async (req, res) => {
  try {
    const { postId, fileId } = req.params;

    const postDownload = await PostDownload.findOne({
      where: { post_id: postId, release_file_id: fileId }
    });

    if (!postDownload) {
      return res.status(404).json({
        success: false,
        message: 'File not attached to this post'
      });
    }

    await postDownload.destroy();

    res.status(200).json({
      success: true,
      message: 'Download file removed from post successfully'
    });
  } catch (error) {
    console.error('Error removing download from post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add release to post
// @route   POST /api/posts/:postId/releases/:releaseId
// @access  Private/Admin
const addReleaseToPost = async (req, res) => {
  try {
    const { postId, releaseId } = req.params;
    const { display_order } = req.body;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const release = await Release.findByPk(releaseId);
    if (!release) {
      return res.status(404).json({
        success: false,
        message: 'Release not found'
      });
    }

    const { PostRelease } = require('../models');
    const existing = await PostRelease.findOne({
      where: { post_id: postId, release_id: releaseId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Release already attached to this post'
      });
    }

    await PostRelease.create({
      post_id: postId,
      release_id: releaseId,
      display_order: display_order || 0
    });

    res.status(201).json({
      success: true,
      message: 'Release added to post successfully'
    });
  } catch (error) {
    console.error('Error adding release to post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Remove release from post
// @route   DELETE /api/posts/:postId/releases/:releaseId
// @access  Private/Admin
const removeReleaseFromPost = async (req, res) => {
  try {
    const { postId, releaseId } = req.params;

    const { PostRelease } = require('../models');
    const postRelease = await PostRelease.findOne({
      where: { post_id: postId, release_id: releaseId }
    });

    if (!postRelease) {
      return res.status(404).json({
        success: false,
        message: 'Release not attached to this post'
      });
    }

    await postRelease.destroy();

    res.status(200).json({
      success: true,
      message: 'Release removed from post successfully'
    });
  } catch (error) {
    console.error('Error removing release from post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
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
};