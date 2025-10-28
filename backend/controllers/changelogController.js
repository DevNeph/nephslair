const { Changelog, Project } = require('../models');

// @desc    Get all changelogs for a project
// @route   GET /api/changelogs/project/:projectSlug
// @access  Public
const getChangelogsByProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { slug: req.params.projectSlug }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const changelogs = await Changelog.findAll({
      where: { project_id: project.id },
      order: [['release_date', 'DESC']],
      attributes: ['id', 'version', 'explanation', 'release_date', 'content', 'created_at']
    });

    res.status(200).json({
      success: true,
      count: changelogs.length,
      data: changelogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all changelogs (Admin)
// @route   GET /api/changelogs/admin/all
// @access  Private/Admin
const getAllChangelogsAdmin = async (req, res) => {
  try {
    const changelogs = await Changelog.findAll({
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: changelogs.length,
      data: changelogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get changelog by ID (Admin)
// @route   GET /api/changelogs/admin/:id
// @access  Private/Admin
const getChangelogById = async (req, res) => {
  try {
    const changelog = await Changelog.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    if (!changelog) {
      return res.status(404).json({
        success: false,
        message: 'Changelog not found'
      });
    }

    res.status(200).json({
      success: true,
      data: changelog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new changelog
// @route   POST /api/changelogs
// @access  Private/Admin
const createChangelog = async (req, res) => {
  try {
    const { project_id, version, explanation, release_date, content } = req.body;

    if (!project_id || !version) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project_id and version'
      });
    }

    // Check if project exists
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const changelog = await Changelog.create({
      project_id,
      version,
      explanation,
      release_date: release_date || new Date(),
      content: typeof content === 'string' ? content : JSON.stringify(content)
    });

    res.status(201).json({
      success: true,
      message: 'Changelog created successfully',
      data: changelog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update changelog
// @route   PUT /api/changelogs/:id
// @access  Private/Admin
const updateChangelog = async (req, res) => {
  try {
    const { version, explanation, release_date, content } = req.body;

    const changelog = await Changelog.findByPk(req.params.id);

    if (!changelog) {
      return res.status(404).json({
        success: false,
        message: 'Changelog not found'
      });
    }

    if (version) changelog.version = version;
    if (explanation !== undefined) changelog.explanation = explanation;
    if (release_date) changelog.release_date = release_date;
    if (content !== undefined) {
      changelog.content = typeof content === 'string' ? content : JSON.stringify(content);
    }

    await changelog.save();

    res.status(200).json({
      success: true,
      message: 'Changelog updated successfully',
      data: changelog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete changelog
// @route   DELETE /api/changelogs/:id
// @access  Private/Admin
const deleteChangelog = async (req, res) => {
  try {
    const changelog = await Changelog.findByPk(req.params.id);

    if (!changelog) {
      return res.status(404).json({
        success: false,
        message: 'Changelog not found'
      });
    }

    await changelog.destroy();

    res.status(200).json({
      success: true,
      message: 'Changelog deleted successfully'
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
  getChangelogsByProject,
  getAllChangelogsAdmin,
  getChangelogById,
  createChangelog,
  updateChangelog,
  deleteChangelog
};