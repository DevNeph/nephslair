import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiPlus, FiTrash2, FiEye, FiUpload, FiDownload } from 'react-icons/fi';
import { 
  createRelease, 
  updateRelease, 
  getReleaseById,
  addFileToRelease,
  deleteReleaseFile
} from '../../../services/releaseService';
import api from '../../../services/api';
import Loading from '../../../components/common/Loading';
import toast from 'react-hot-toast';

const ReleaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [projects, setProjects] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    project_id: '',
    version: '',
    release_notes: '',
    release_date: new Date().toISOString().split('T')[0],
    is_published: true
  });

  const [files, setFiles] = useState([]);
  const [newFile, setNewFile] = useState({
    platform: '',
    file_name: '',
    file_url: '',
    file_size: '',
    file_type: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProjects();
    if (isEditMode) {
      fetchRelease();
    }
  }, [id]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/admin/all');
      setProjects(response.data.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const fetchRelease = async () => {
    try {
      setLoading(true);
      const release = await getReleaseById(id);
      
      setFormData({
        project_id: release.project_id,
        version: release.version,
        release_notes: release.release_notes || '',
        release_date: release.release_date.split('T')[0],
        is_published: release.is_published
      });
      
      setFiles(release.files || []);
    } catch (error) {
      console.error('Error fetching release:', error);
      toast.error('Failed to load release');
      navigate('/admin/releases');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, value } = e.target;
    setNewFile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/release-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      }
    });

    const uploadedFile = response.data.data;

    // ✅ Backend'den gelen tam URL'i kullan
    setNewFile({
      platform: newFile.platform || '',
      file_name: uploadedFile.file_name,
      file_url: uploadedFile.file_url, // Zaten tam URL geldi
      file_size: uploadedFile.file_size.toString(),
      file_type: uploadedFile.file_type
    });

    toast.success('File uploaded successfully!');
  } catch (error) {
    console.error('Upload error:', error);
    toast.error(error.response?.data?.message || 'Failed to upload file');
  } finally {
    setUploading(false);
    setUploadProgress(0);
    e.target.value = '';
  }
};

  const validateForm = () => {
    const newErrors = {};

    if (!formData.project_id) {
      newErrors.project_id = 'Please select a project';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Version is required';
    }

    if (!formData.release_date) {
      newErrors.release_date = 'Release date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFile = () => {
    if (!newFile.platform.trim()) {
      toast.error('Platform is required');
      return false;
    }
    if (!newFile.file_name.trim()) {
      toast.error('Please upload a file first');
      return false;
    }
    if (!newFile.file_url.trim()) {
      toast.error('File URL is required');
      return false;
    }
    return true;
  };

  const handleAddFile = async () => {
    if (!validateFile()) return;

    if (isEditMode) {
      // Add file to existing release
      try {
        const fileData = {
          ...newFile,
          file_size: newFile.file_size ? parseInt(newFile.file_size) : null
        };
        
        await addFileToRelease(id, fileData);
        toast.success('File added successfully');
        fetchRelease(); // Refresh to get updated files
        
        // Reset form
        setNewFile({
          platform: '',
          file_name: '',
          file_url: '',
          file_size: '',
          file_type: ''
        });
      } catch (error) {
        console.error('Error adding file:', error);
        toast.error('Failed to add file');
      }
    } else {
      // Add to local state for new release
      setFiles([...files, { ...newFile, id: Date.now() }]);
      setNewFile({
        platform: '',
        file_name: '',
        file_url: '',
        file_size: '',
        file_type: ''
      });
      toast.success('File added to list');
    }
  };

  const handleRemoveFile = async (fileId, isServerFile) => {
    if (isServerFile && isEditMode) {
      if (window.confirm('Are you sure you want to delete this file?')) {
        try {
          await deleteReleaseFile(fileId);
          toast.success('File deleted successfully');
          fetchRelease();
        } catch (error) {
          console.error('Error deleting file:', error);
          toast.error('Failed to delete file');
        }
      }
    } else {
      setFiles(files.filter(f => f.id !== fileId));
      toast.success('File removed from list');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      const releaseData = {
        ...formData,
        project_id: parseInt(formData.project_id)
      };

      if (isEditMode) {
        await updateRelease(id, releaseData);
        toast.success('Release updated successfully');
      } else {
        const response = await createRelease(releaseData);
        const releaseId = response.data.id;

        // Add files to the newly created release
        if (files.length > 0) {
          await Promise.all(
            files.map(file => 
              addFileToRelease(releaseId, {
                ...file,
                file_size: file.file_size ? parseInt(file.file_size) : null
              })
            )
          );
        }

        toast.success('Release created successfully');
      }

      navigate('/admin/releases');
    } catch (error) {
      console.error('Error saving release:', error);
      toast.error(error.response?.data?.message || 'Failed to save release');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      navigate('/admin/releases');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {isEditMode ? 'Edit Release' : 'Create New Release'}
        </h1>
        <p className="text-gray-400">
          {isEditMode ? 'Update release details and files' : 'Create a new version release for a project'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Release Information */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Release Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                disabled={isEditMode}
                className={`w-full bg-neutral-800 border ${
                  errors.project_id ? 'border-red-500' : 'border-neutral-700'
                } rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.project_id && <p className="text-red-500 text-sm mt-1">{errors.project_id}</p>}
            </div>

            {/* Version */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Version <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                placeholder="e.g., 2.0.1"
                className={`w-full bg-neutral-800 border ${
                  errors.version ? 'border-red-500' : 'border-neutral-700'
                } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500`}
              />
              {errors.version && <p className="text-red-500 text-sm mt-1">{errors.version}</p>}
            </div>

            {/* Release Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Release Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="release_date"
                value={formData.release_date}
                onChange={handleChange}
                className={`w-full bg-neutral-800 border ${
                  errors.release_date ? 'border-red-500' : 'border-neutral-700'
                } rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500`}
              />
              {errors.release_date && <p className="text-red-500 text-sm mt-1">{errors.release_date}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="is_published"
                value={formData.is_published ? 'published' : 'draft'}
                onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.value === 'published' }))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
              >
                <option value="draft">Draft (Hidden from public)</option>
                <option value="published">Published (Visible to everyone)</option>
              </select>
              <p className="text-gray-500 text-xs mt-1">
                Draft releases are only visible to admins. Published releases are visible to everyone.
              </p>
            </div>
          </div>

          {/* Release Notes */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Release Notes <span className="text-gray-500">(Markdown supported)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <FiEye /> {showPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>

            {showPreview ? (
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 min-h-[300px] prose prose-invert max-w-none">
                {formData.release_notes ? (
                  <div dangerouslySetInnerHTML={{ __html: formData.release_notes.replace(/\n/g, '<br />') }} />
                ) : (
                  <p className="text-gray-500 italic">No release notes yet</p>
                )}
              </div>
            ) : (
              <textarea
                name="release_notes"
                value={formData.release_notes}
                onChange={handleChange}
                rows="12"
                placeholder="## What's New&#10;- Feature 1&#10;- Feature 2&#10;&#10;## Bug Fixes&#10;- Fixed issue #123"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none font-mono text-sm"
              />
            )}
          </div>
        </div>

{/* Files Management */}
<div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
  <h2 className="text-xl font-bold text-white mb-6">Download Files</h2>

  {/* Add File Form */}
  <div className="bg-neutral-800 rounded-lg p-4 mb-6">
    <h3 className="text-white font-medium mb-4">Add New File</h3>

    <div className="space-y-4">
      {/* Platform Dropdown */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Platform <span className="text-red-500">*</span>
        </label>
        <select
          name="platform"
          value={newFile.platform}
          onChange={handleFileChange}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
        >
          <option value="">Select Platform</option>
          <option value="All">All Platforms</option>
          <option value="Windows">Windows</option>
          <option value="Mac">Mac</option>
          <option value="Linux">Linux</option>
        </select>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Upload File <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          <label className="flex-1 cursor-pointer">
            <div className={`flex items-center justify-center gap-2 px-4 py-8 bg-neutral-900 border-2 border-dashed rounded-lg transition ${
              uploading 
                ? 'border-purple-500 bg-purple-500/5' 
                : 'border-neutral-700 hover:border-purple-500 hover:bg-neutral-800'
            }`}>
              <FiUpload className={uploading ? 'text-purple-400 animate-pulse' : 'text-gray-400'} size={24} />
              <div className="text-center">
                {uploading ? (
                  <>
                    <p className="text-purple-400 font-medium">Uploading... {uploadProgress}%</p>
                    <p className="text-gray-500 text-sm mt-1">Please wait</p>
                  </>
                ) : newFile.file_name ? (
                  <>
                    <p className="text-white font-medium">{newFile.file_name}</p>
                    <p className="text-gray-500 text-sm mt-1">Click to change file</p>
                  </>
                ) : (
                  <>
                    <p className="text-white font-medium">Choose file or drag here</p>
                    <p className="text-gray-500 text-sm mt-1">Max 500MB • ZIP, RAR, EXE, DMG, etc.</p>
                  </>
                )}
              </div>
            </div>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept=".zip,.rar,.tar,.gz,.7z,.exe,.dmg,.pdf,.txt,.deb,.rpm,.pkg,.appimage"
            />
          </label>
        </div>
        {uploading && (
          <div className="mt-3 bg-neutral-900 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-purple-600 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
        {newFile.file_name && !uploading && (
          <div className="mt-3 flex items-center justify-between bg-neutral-900 rounded-lg px-4 py-2">
            <div className="flex items-center gap-3">
              <FiUpload className="text-green-400" />
              <div>
                <p className="text-white text-sm font-medium">{newFile.file_name}</p>
                <p className="text-gray-500 text-xs">
                  {newFile.file_type?.toUpperCase()} • {(parseInt(newFile.file_size) / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNewFile({
                platform: newFile.platform,
                file_name: '',
                file_url: '',
                file_size: '',
                file_type: ''
              })}
              className="text-red-400 hover:text-red-300"
            >
              <FiX size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Add File Button */}
      <button
        type="button"
        onClick={handleAddFile}
        disabled={!newFile.file_url || !newFile.platform || uploading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiPlus /> Add File to Release
      </button>
    </div>
  </div>

  {/* Files List */}
  {files.length > 0 ? (
    <div className="space-y-3">
      <h3 className="text-white font-medium">Added Files ({files.length})</h3>
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between bg-neutral-800 rounded-lg p-4 hover:bg-neutral-750 transition"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <FiDownload className="text-purple-400" size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-1 bg-neutral-700 text-white text-xs font-medium rounded">
                  {file.platform}
                </span>
                {file.download_count !== undefined && (
                  <span className="text-gray-500 text-xs">
                    {file.download_count} downloads
                  </span>
                )}
              </div>
              <p className="text-white font-medium text-sm">{file.file_name}</p>
              <p className="text-gray-500 text-xs mt-1">
                {file.file_type && `${file.file_type.toUpperCase()} • `}
                {file.file_size && `${(file.file_size / 1024 / 1024).toFixed(1)} MB`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleRemoveFile(file.id, !!file.release_id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition"
            title="Delete file"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-12 border-2 border-dashed border-neutral-700 rounded-lg">
      <FiUpload className="mx-auto text-gray-600 mb-3" size={48} />
      <p className="text-gray-500">No files added yet</p>
      <p className="text-gray-600 text-sm mt-1">Upload a file to get started</p>
    </div>
  )}
</div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
          >
            <FiX /> Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave /> {saving ? 'Saving...' : isEditMode ? 'Update Release' : 'Create Release'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReleaseForm;