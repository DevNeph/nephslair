const { Download, Project } = require('../models');
const { success, error } = require('../utils/response');
const { validateFields } = require('../utils/validate');

// @desc    Get all downloads for a project
// @route   GET /api/downloads/project/:projectSlug
// @access  Public
const getDownloadsByProject = async (req, res) => {
  try {
    const project = await Project.findOne({ where: { slug: req.params.projectSlug } });
    if (!project) return error(res, 'Project not found', 404);

    const downloads = await Download.findAll({
      where: { project_id: project.id },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'title', 'description', 'version', 'file_url', 'file_size', 'file_type', 'download_count', 'is_active', 'created_at']
    });

    return success(res, downloads, undefined, 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Get single download
// @route   GET /api/downloads/:id
// @access  Public
const getDownload = async (req, res) => {
  try {
    const download = await Download.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'slug'] }]
    });
    if (!download) return error(res, 'Download not found', 404);

    return success(res, download, undefined, 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Get all downloads (Admin)
// @route   GET /api/downloads/admin/all
// @access  Private/Admin
const getAllDownloadsAdmin = async (req, res) => {
  try {
    const downloads = await Download.findAll({
      order: [['created_at', 'DESC']],
      include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'slug'] }]
    });
    return success(res, downloads, undefined, 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Get download by ID (Admin)
// @route   GET /api/downloads/admin/:id
// @access  Private/Admin
const getDownloadById = async (req, res) => {
  try {
    const download = await Download.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'slug'] }]
    });
    if (!download) return error(res, 'Download not found', 404);

    return success(res, download, undefined, 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Increment download count
// @route   POST /api/downloads/:id/increment
// @access  Public
const incrementDownloadCount = async (req, res) => {
  try {
    const download = await Download.findByPk(req.params.id);
    if (!download) return error(res, 'Download not found', 404);

    download.download_count += 1;
    await download.save();

    return success(res, { download_count: download.download_count }, undefined, 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Create new download
// @route   POST /api/downloads
// @access  Private/Admin
const createDownload = async (req, res) => {
  try {
    const { project_id, title, description, version, file_url, file_size, file_type } = req.body;
    const validationError = validateFields(req.body, ['project_id', 'title', 'file_url']);
    if (validationError) return error(res, validationError, 400);

    const project = await Project.findByPk(project_id);
    if (!project) return error(res, 'Project not found', 404);

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

    return success(res, download, 'Download created successfully', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Update download
// @route   PUT /api/downloads/:id
// @access  Private/Admin
const updateDownload = async (req, res) => {
  try {
    const { title, description, version, file_url, file_size, file_type, is_active } = req.body;
    const download = await Download.findByPk(req.params.id);
    if (!download) return error(res, 'Download not found', 404);

    if (title) download.title = title;
    if (description !== undefined) download.description = description;
    if (version !== undefined) download.version = version;
    if (file_url) download.file_url = file_url;
    if (file_size !== undefined) download.file_size = file_size;
    if (file_type !== undefined) download.file_type = file_type;
    if (is_active !== undefined) download.is_active = is_active;

    await download.save();
    return success(res, download, 'Download updated successfully', 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// @desc    Delete download
// @route   DELETE /api/downloads/:id
// @access  Private/Admin
const deleteDownload = async (req, res) => {
  try {
    const download = await Download.findByPk(req.params.id);
    if (!download) return error(res, 'Download not found', 404);

    await download.destroy();
    return success(res, null, 'Download deleted successfully', 200);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
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