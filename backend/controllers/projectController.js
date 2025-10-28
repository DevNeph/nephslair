const { Project, Post, Release } = require('../models');

// @desc    Get all projects (Public - only published)
// @route   GET /api/projects
// @access  Public
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { status: 'published' },
      order: [['created_at', 'DESC']] 
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all projects (Admin - including drafts)
// @route   GET /api/projects/admin/all
// @access  Private/Admin
const getAllProjectsAdmin = async (req, res) => {
  try {
    console.log('📊 Admin fetching all projects...');
    
    const projects = await Project.findAll({
      order: [['created_at', 'DESC']],  // ← DEĞİŞTİRİLDİ!
      include: [{
        model: Post,
        as: 'posts',
        attributes: ['id']
      }]
    });

    const projectsWithCount = projects.map(project => {
      const projectData = project.toJSON();
      projectData.postCount = projectData.posts?.length || 0;
      delete projectData.posts;
      return projectData;
    });

    console.log(`✅ Found ${projects.length} projects`);

    res.status(200).json({
      success: true,
      count: projectsWithCount.length,
      data: projectsWithCount
    });
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get project by slug
// @route   GET /api/projects/:slug
// @access  Public
const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { slug: req.params.slug }
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
    console.error('Error fetching project:', error);
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
    console.log('📝 Creating new project:', req.body);
    
    const { name, slug, description, status } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and slug'
      });
    }

    const existingProject = await Project.findOne({ where: { slug } });
    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'A project with this slug already exists'
      });
    }

    const project = await Project.create({
      name,
      slug,
      description: description || null,
      status: status || 'draft'
    });

    console.log('✅ Project created:', project.id);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    console.error('❌ Error creating project:', error);
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
    console.log('📝 Updating project:', req.params.id, req.body);
    
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const { name, slug, description, status } = req.body;
    
    if (name) project.name = name;
    if (slug) {
      const { Op } = require('sequelize');
      const existingProject = await Project.findOne({ 
        where: { 
          slug,
          id: { [Op.ne]: req.params.id }
        } 
      });
      
      if (existingProject) {
        return res.status(400).json({
          success: false,
          message: 'A project with this slug already exists'
        });
      }
      
      project.slug = slug;
    }
    if (description !== undefined) project.description = description;
    if (status) project.status = status;

    await project.save();

    console.log('✅ Project updated:', project.id);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error('❌ Error updating project:', error);
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
    console.log('🗑️ Deleting project:', req.params.id);
    
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await project.destroy();

    console.log('✅ Project deleted:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get project by ID (Admin)
// @route   GET /api/projects/admin/:id
// @access  Private/Admin
const getProjectById = async (req, res) => {
  try {
    console.log('📊 Fetching project by ID:', req.params.id);
    
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    console.log('✅ Project found:', project.name);

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('❌ Error fetching project:', error);
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
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};