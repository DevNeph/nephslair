const { Project, Post, Download } = require('../models');

// @desc    Get all published projects
// @route   GET /api/projects
// @access  Public
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { status: 'published' },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'name', 'slug', 'description', 'latest_version', 'created_at', 'updated_at']
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all projects (including drafts) - Admin only
// @route   GET /api/projects/all
// @access  Private/Admin
const getAllProjectsAdmin = async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single project by slug
// @route   GET /api/projects/:slug
// @access  Public
const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { 
        slug: req.params.slug,
        status: 'published'
      },
      include: [
        {
          model: Post,
          as: 'posts',
          where: { status: 'published' },
          required: false,
          order: [['published_at', 'DESC']]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const { name, slug, description, status, latest_version } = req.body;

    // Validation
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and slug'
      });
    }

    // Check if slug already exists
    const slugExists = await Project.findOne({ where: { slug } });
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists'
      });
    }

    const project = await Project.create({
      name,
      slug,
      description,
      status: status || 'draft',
      latest_version
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    const { name, slug, description, status, latest_version } = req.body;

    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if new slug already exists (excluding current project)
    if (slug && slug !== project.slug) {
      const slugExists = await Project.findOne({ 
        where: { slug },
        attributes: ['id']
      });
      if (slugExists && slugExists.id !== project.id) {
        return res.status(400).json({
          success: false,
          message: 'Slug already exists'
        });
      }
    }

    // Update fields
    if (name) project.name = name;
    if (slug) project.slug = slug;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (latest_version !== undefined) project.latest_version = latest_version;

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await project.destroy();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllProjects,
  getAllProjectsAdmin,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject
};