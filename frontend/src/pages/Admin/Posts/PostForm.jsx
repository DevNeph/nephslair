import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiEye } from 'react-icons/fi';
import api from '../../../services/api';
import Loading from '../../../components/common/Loading';
import toast from 'react-hot-toast';

const PostForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    project_id: '',
    status: 'draft',
    excerpt: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProjects();
    if (isEditMode) {
      fetchPost();
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

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${id}`);
      const post = response.data.data;
      
      setFormData({
        title: post.title,
        content: post.content,
        project_id: post.project_id,
        status: post.status,
        excerpt: post.excerpt || ''
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
      navigate('/admin/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.project_id) {
      newErrors.project_id = 'Please select a project';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      if (isEditMode) {
        await api.put(`/posts/${id}`, formData);
        toast.success('Post updated successfully');
      } else {
        await api.post('/posts', formData);
        toast.success('Post created successfully');
      }

      navigate('/admin/posts');
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(error.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      navigate('/admin/posts');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {isEditMode ? 'Edit Post' : 'Create New Post'}
        </h1>
        <p className="text-gray-400">
          {isEditMode ? 'Update post details' : 'Fill in the details below to create a new post'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full bg-neutral-800 border ${
                errors.title ? 'border-red-500' : 'border-neutral-700'
              } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500`}
              placeholder="Enter post title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              className={`w-full bg-neutral-800 border ${
                errors.project_id ? 'border-red-500' : 'border-neutral-700'
              } rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer`}
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Excerpt (Optional)
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows="3"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Brief summary of the post (optional)"
            />
            <p className="text-gray-500 text-xs mt-1">
              This will be displayed in post cards. If left empty, first 150 characters of content will be used.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Content <span className="text-red-500">*</span>
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
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 min-h-[400px]">
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: formData.content.replace(/\n/g, '<br />')
                  }}
                />
              </div>
            ) : (
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="15"
                className={`w-full bg-neutral-800 border ${
                  errors.content ? 'border-red-500' : 'border-neutral-700'
                } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none font-mono text-sm`}
                placeholder="Write your post content here..."
              />
            )}
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            <p className="text-gray-500 text-xs mt-1">
              Supports Markdown formatting. Use preview to see how it will look.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={handleChange}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="text-white">Draft</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={formData.status === 'published'}
                  onChange={handleChange}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="text-white">Published</span>
              </label>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Draft posts are only visible to admins. Published posts are visible to everyone.
            </p>
          </div>
        </div>

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
            <FiSave /> {saving ? 'Saving...' : isEditMode ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;