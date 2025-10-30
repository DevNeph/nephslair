const { Project, Post, Release } = require('../models');
const { validateFields } = require('../utils/validate');
const { success, error } = require('../utils/response');

// @desc    Get all projects (Public - only published)
// @route   GET /api/projects
// @access  Public
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { status: 'published' },
      order: [['created_at', 'DESC']] 
    });

    return success(res, projects, undefined, 200);
  } catch (err) {
    console.error('Error fetching projects:', err);
    return error(res, 'Server error', 500, err.message);
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

    return success(res, projectsWithCount, undefined, 200);
  } catch (err) {
    console.error('❌ Error fetching projects:', err);
    return error(res, 'Server error', 500, err.message);
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
      return error(res, 'Project not found', 404);
    }

    return success(res, project);
  } catch (err) {
    console.error('Error fetching project:', err);
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const { name, slug, description, status } = req.body;
    const validationError = validateFields(req.body, ['name', 'slug']);
    if (validationError) return error(res, validationError, 400);
    const existingProject = await Project.findOne({ where: { slug } });
    if (existingProject) return error(res, 'A project with this slug already exists', 400);
    const project = await Project.create({
      name,
      slug,
      description: description || null,
      status: status || 'draft'
    });
    return success(res, project, 'Project created successfully', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return error(res, 'Project not found', 404);
    const { name, slug, description, status } = req.body;
    if (name) project.name = name;
    if (slug) {
      const { Op } = require('sequelize');
      const existingProject = await Project.findOne({ where: { slug, id: { [Op.ne]: req.params.id } } });
      if (existingProject) {
        return error(res, 'A project with this slug already exists', 400);
      }
      project.slug = slug;
    }
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    await project.save();
    return success(res, project, 'Project updated successfully', 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
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
      return error(res, 'Project not found', 404);
    }

    await project.destroy();

    console.log('✅ Project deleted:', req.params.id);

    return success(res, null, 'Project deleted successfully', 204);
  } catch (err) {
    console.error('❌ Error deleting project:', err);
    return error(res, 'Server error', 500, err.message);
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
      return error(res, 'Project not found', 404);
    }

    console.log('✅ Project found:', project.name);

    return success(res, project);
  } catch (err) {
    console.error('❌ Error fetching project:', err);
    return error(res, 'Server error', 500, err.message);
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