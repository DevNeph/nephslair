const { Post, Project, Comment, User, Poll, PollOption, Vote, sequelize } = require('../models');

// @desc    Get all published posts (for homepage)
// @route   GET /api/posts
// @access  Public
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
    const post = await Post.findOne({
      where: {
        slug: req.params.slug,
        status: 'published'
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
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ],
          order: [['created_at', 'DESC']]
        },
        {
          model: Poll,
          as: 'polls',
          where: { is_active: true },
          required: false,
          include: [
            {
              model: PollOption,
              as: 'options'
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

    // Validation 
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content'
      });
    }

    // Auto-generate slug from title
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if project exists
    if (project_id) {
      const project = await Project.findByPk(project_id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
    }

    // Check if slug already exists
    const slugExists = await Post.findOne({ where: { slug } });
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists. Please use a different title.'
      });
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

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
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

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private/Admin
const updatePost = async (req, res) => {
  try {
    const { title, slug, content, excerpt, status } = req.body;

    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if new slug already exists (excluding current post)
    if (slug && slug !== post.slug) {
      const slugExists = await Post.findOne({ where: { slug } });
      if (slugExists && slugExists.id !== post.id) {
        return res.status(400).json({
          success: false,
          message: 'Slug already exists'
        });
      }
    }

    // Update fields
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

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
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

    // Check if user already voted
    let vote = await Vote.findOne({
      where: {
        user_id: userId,
        post_id: postId
      }
    });

    if (vote) {
      // User already voted
      if (vote.vote_type === vote_type) {
        // Same vote - remove it (toggle)
        await vote.destroy();
        
        // Update post vote counts
        if (vote_type === 'upvote') {
          post.upvotes = Math.max(0, post.upvotes - 1);
        } else {
          post.downvotes = Math.max(0, post.downvotes - 1);
        }
      } else {
        // Different vote - change it
        const oldVote = vote.vote_type;
        vote.vote_type = vote_type;
        await vote.save();
        
        // Update post vote counts
        if (vote_type === 'upvote') {
          post.upvotes += 1;
          post.downvotes = Math.max(0, post.downvotes - 1);
        } else {
          post.downvotes += 1;
          post.upvotes = Math.max(0, post.upvotes - 1);
        }
      }
    } else {
      // New vote
      await Vote.create({
        user_id: userId,
        post_id: postId,
        vote_type: vote_type
      });
      
      // Update post vote counts
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
  votePost
};