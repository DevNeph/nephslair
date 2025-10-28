const { Download, Project } = require('../models');

// @desc    Get all downloads for a project
// @route   GET /api/downloads/project/:projectSlug
// @access  Public
const getDownloadsByProject = async (req, res) => {
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

    const downloads = await Download.findAll({
      where: { 
        project_id: project.id
      },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'title', 'description', 'version', 'file_url', 'file_size', 'file_type', 'download_count', 'is_active', 'created_at']
    });

    res.status(200).json({
      success: true,
      count: downloads.length,
      data: downloads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single download
// @route   GET /api/downloads/:id
// @access  Public
const getDownload = async (req, res) => {
  try {
    const download = await Download.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    if (!download) {
      return res.status(404).json({
        success: false,
        message: 'Download not found'
      });
    }

    res.status(200).json({
      success: true,
      data: download
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all downloads (Admin)
// @route   GET /api/downloads/admin/all
// @access  Private/Admin
const getAllDownloadsAdmin = async (req, res) => {
  try {
    const downloads = await Download.findAll({
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
      count: downloads.length,
      data: downloads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get download by ID (Admin)
// @route   GET /api/downloads/admin/:id
// @access  Private/Admin
const getDownloadById = async (req, res) => {
  try {
    const download = await Download.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    if (!download) {
      return res.status(404).json({
        success: false,
        message: 'Download not found'
      });
    }

    res.status(200).json({
      success: true,
      data: download
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Increment download count
// @route   POST /api/downloads/:id/increment
// @access  Public
const incrementDownloadCount = async (req, res) => {
  try {
    const download = await Download.findByPk(req.params.id);

    if (!download) {
      return res.status(404).json({
        success: false,
        message: 'Download not found'
      });
    }

    download.download_count += 1;
    await download.save();

    res.status(200).json({
      success: true,
      data: {
        download_count: download.download_count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new download
// @route   POST /api/downloads
// @access  Private/Admin
const createDownload = async (req, res) => {
  try {
    const { project_id, title, description, version, file_url, file_size, file_type } = req.body;

    if (!project_id || !title || !file_url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project_id, title and file_url'
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

    const download = await Download.create({
      project_id,
      title,
      description,
      version,
      file_url,
      file_size,
      file_type,
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Download created successfully',
      data: download
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update download
// @route   PUT /api/downloads/:id
// @access  Private/Admin
const updateDownload = async (req, res) => {
  try {
    const { title, description, version, file_url, file_size, file_type, is_active } = req.body;

    const download = await Download.findByPk(req.params.id);

    if (!download) {
      return res.status(404).json({
        success: false,
        message: 'Download not found'
      });
    }

    if (title) download.title = title;
    if (description !== undefined) download.description = description;
    if (version !== undefined) download.version = version;
    if (file_url) download.file_url = file_url;
    if (file_size !== undefined) download.file_size = file_size;
    if (file_type !== undefined) download.file_type = file_type;
    if (is_active !== undefined) download.is_active = is_active;

    await download.save();

    res.status(200).json({
      success: true,
      message: 'Download updated successfully',
      data: download
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete download
// @route   DELETE /api/downloads/:id
// @access  Private/Admin
const deleteDownload = async (req, res) => {
  try {
    const download = await Download.findByPk(req.params.id);

    if (!download) {
      return res.status(404).json({
        success: false,
        message: 'Download not found'
      });
    }

    await download.destroy();

    res.status(200).json({
      success: true,
      message: 'Download deleted successfully'
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
  getDownloadsByProject,
  getDownload,
  getAllDownloadsAdmin,
  getDownloadById,
  incrementDownloadCount,
  createDownload,
  updateDownload,
  deleteDownload
};