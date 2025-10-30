const { Release, ReleaseFile, Project } = require('../models');
const path = require('path');
const fs = require('fs'); 

// ✅ Helper function to update project's latest version
const updateProjectLatestVersion = async (projectId) => {
  try {
    const latestRelease = await Release.findOne({
      where: { 
        project_id: projectId,
        is_published: true 
      },
      order: [['release_date', 'DESC']],
      attributes: ['version']
    });

    await Project.update(
      { latest_version: latestRelease ? latestRelease.version : null },
      { where: { id: projectId } }
    );
  } catch (error) {
    console.error('Error updating project latest version:', error);
  }
};

// @desc    Get all releases with optional project filter
// @route   GET /api/releases?project_id=X
// @access  Public
const getAllReleases = async (req, res) => {
  try {
    const { project_id } = req.query;
    
    const whereClause = { is_published: true };
    if (project_id) {
      whereClause.project_id = project_id;
    }

    const releases = await Release.findAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ReleaseFile,
          as: 'files',
          attributes: ['id', 'file_name', 'file_url', 'file_size', 'file_type', 'platform', 'download_count']
        }
      ],
      order: [['release_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: releases.length,
      data: releases
    });
  } catch (error) {
    console.error('Error fetching releases:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all releases for a project
// @route   GET /api/releases/project/:projectSlug
// @access  Public
const getReleasesByProject = async (req, res) => {
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

    const releases = await Release.findAll({
      where: { 
        project_id: project.id,
        is_published: true 
      },
      include: [
        {
          model: ReleaseFile,
          as: 'files',
          attributes: ['id', 'platform', 'file_name', 'file_url', 'file_size', 'file_type', 'download_count']
        }
      ],
      order: [['release_date', 'DESC']],
      attributes: ['id', 'version', 'release_notes', 'release_date', 'created_at']
    });

    res.status(200).json({
      success: true,
      count: releases.length,
      data: releases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all releases (Admin)
// @route   GET /api/releases/admin/all
// @access  Private/Admin
const getAllReleasesAdmin = async (req, res) => {
  try {
    const releases = await Release.findAll({
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ReleaseFile,
          as: 'files'
        }
      ]
    });

    res.status(200).json({
      success: true,
      count: releases.length,
      data: releases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get releases by project ID (Admin)
// @route   GET /api/releases/admin/project/:projectId
// @access  Private/Admin
const getReleasesByProjectIdAdmin = async (req, res) => {
  try {
    const releases = await Release.findAll({
      where: { project_id: req.params.projectId },
      include: [
        {
          model: ReleaseFile,
          as: 'files'
        }
      ],
      order: [['release_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: releases.length,
      data: releases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get release by ID (Admin)
// @route   GET /api/releases/admin/:id
// @access  Private/Admin
const getReleaseById = async (req, res) => {
  try {
    const release = await Release.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ReleaseFile,
          as: 'files'
        }
      ]
    });

    if (!release) {
      return res.status(404).json({
        success: false,
        message: 'Release not found'
      });
    }

    res.status(200).json({
      success: true,
      data: release
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new release
// @route   POST /api/releases
// @access  Private/Admin
const createRelease = async (req, res) => {
  try {
    const { project_id, version, release_notes, release_date, is_published } = req.body;

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

    // Check if version already exists for this project
    const existingRelease = await Release.findOne({
      where: { project_id, version }
    });

    if (existingRelease) {
      return res.status(400).json({
        success: false,
        message: 'This version already exists for this project'
      });
    }

    const release = await Release.create({
      project_id,
      version,
      release_notes,
      release_date: release_date || new Date(),
      is_published: is_published !== undefined ? is_published : true
    });

    // ✅ Update project's latest version
    await updateProjectLatestVersion(project_id);

    res.status(201).json({
      success: true,
      message: 'Release created successfully',
      data: release
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update release
// @route   PUT /api/releases/:id
// @access  Private/Admin
const updateRelease = async (req, res) => {
  try {
    const { version, release_notes, release_date, is_published } = req.body;

    const release = await Release.findByPk(req.params.id);

    if (!release) {
      return res.status(404).json({
        success: false,
        message: 'Release not found'
      });
    }

    if (version) release.version = version;
    if (release_notes !== undefined) release.release_notes = release_notes;
    if (release_date) release.release_date = release_date;
    if (is_published !== undefined) release.is_published = is_published;

    await release.save();

    // ✅ Update project's latest version
    await updateProjectLatestVersion(release.project_id);

    res.status(200).json({
      success: true,
      message: 'Release updated successfully',
      data: release
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete release
// @route   DELETE /api/releases/:id
// @access  Private/Admin
const deleteRelease = async (req, res) => {
  try {
    const release = await Release.findByPk(req.params.id, {
      include: [{
        model: ReleaseFile,
        as: 'files'
      }]
    });

    if (!release) {
      return res.status(404).json({
        success: false,
        message: 'Release not found'
      });
    }

    const projectId = release.project_id;

    // ✅ Delete all physical files associated with this release
    if (release.files && release.files.length > 0) {
      for (const file of release.files) {
        try {
          // Extract filename from URL
          const fileUrl = file.file_url;
          const filename = fileUrl.split('/downloads/').pop();
          
          if (filename) {
            const filePath = path.join(__dirname, '../downloads', filename);
            
            // Check if file exists and delete it
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`✅ Deleted physical file: ${filename}`);
            }
          }
        } catch (fileError) {
          console.error(`❌ Error deleting file ${file.file_name}:`, fileError);
        }
      }
    }

    await release.destroy();

    // ✅ Update project's latest version
    await updateProjectLatestVersion(projectId);

    res.status(200).json({
      success: true,
      message: 'Release and associated files deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add file to release
// @route   POST /api/releases/:id/files
// @access  Private/Admin
const addFileToRelease = async (req, res) => {
  try {
    const { platform, file_name, file_url, file_size, file_type } = req.body;

    if (!platform || !file_name || !file_url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide platform, file_name and file_url'
      });
    }

    const release = await Release.findByPk(req.params.id);
    if (!release) {
      return res.status(404).json({
        success: false,
        message: 'Release not found'
      });
    }

    const file = await ReleaseFile.create({
      release_id: req.params.id,
      platform,
      file_name,
      file_url,
      file_size,
      file_type
    });

    res.status(201).json({
      success: true,
      message: 'File added to release successfully',
      data: file
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update release file
// @route   PUT /api/releases/files/:fileId
// @access  Private/Admin
const updateReleaseFile = async (req, res) => {
  try {
    const { platform, file_name, file_url, file_size, file_type } = req.body;

    const file = await ReleaseFile.findByPk(req.params.fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // ✅ Store old file info if URL is changing
    const oldFileUrl = file.file_url;
    const isUrlChanging = file_url && file_url !== oldFileUrl;

    if (platform) file.platform = platform;
    if (file_name) file.file_name = file_name;
    if (file_url) file.file_url = file_url;
    if (file_size !== undefined) file.file_size = file_size;
    if (file_type !== undefined) file.file_type = file_type;

    await file.save();

    // ✅ If URL changed, delete old physical file
    if (isUrlChanging) {
      try {
        const oldFilename = oldFileUrl.split('/downloads/').pop();
        if (oldFilename) {
          const oldFilePath = path.join(__dirname, '../downloads', oldFilename);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log(`✅ Deleted old file: ${oldFilename}`);
          }
        }
      } catch (fileError) {
        console.error('❌ Error deleting old file:', fileError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'File updated successfully',
      data: file
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete release file
// @route   DELETE /api/releases/files/:fileId
// @access  Private/Admin
const deleteReleaseFile = async (req, res) => {
  try {
    const file = await ReleaseFile.findByPk(req.params.fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // ✅ Delete physical file
    try {
      const fileUrl = file.file_url;
      const filename = fileUrl.split('/downloads/').pop();
      
      if (filename) {
        const filePath = path.join(__dirname, '../downloads', filename);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Deleted physical file: ${filename}`);
        }
      }
    } catch (fileError) {
      console.error('❌ Error deleting physical file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    await file.destroy();

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Increment file download count
// @route   POST /api/releases/files/:fileId/download
// @access  Public
const incrementDownloadCount = async (req, res) => {
  try {
    const file = await ReleaseFile.findByPk(req.params.fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    file.download_count += 1;
    await file.save();

    res.status(200).json({
      success: true,
      data: {
        download_count: file.download_count
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

// @desc    Download release file
// @route   GET /api/releases/download/:fileId
// @access  Public
const downloadFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Get file info from database
    const file = await ReleaseFile.findByPk(fileId);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Increment download count
    await file.increment('download_count');

    // Extract filename from URL
    const filename = file.file_url.split('/').pop();
    const filePath = path.join(__dirname, '../downloads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send file
    res.download(filePath, file.file_name, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file'
          });
        }
      }
    });
  } catch (error) {
    console.error('Error in downloadFile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllReleases,
  getReleasesByProject,
  getAllReleasesAdmin,
  getReleasesByProjectIdAdmin,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease,
  addFileToRelease,
  updateReleaseFile,
  deleteReleaseFile,
  incrementDownloadCount,
  downloadFile
};