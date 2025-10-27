import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { updateProject } from '../../../services/projectService';
import api from '../../../services/api'; // ← EKLENDĐ!
import ErrorMessage from '../../../components/common/ErrorMessage';
import Loading from '../../../components/common/Loading';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Watch name field for auto-slug generation
  const nameValue = watch('name');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching project ID:', id);
      
      const response = await api.get(`/projects/admin/${id}`);
      const project = response.data.data;
      
      console.log('✅ Project loaded:', project);
      
      // Form değerlerini doldur
      setValue('name', project.name);
      setValue('slug', project.slug);
      setValue('description', project.description || '');
      setValue('status', project.status);
      
    } catch (err) {
      console.error('❌ Error loading project:', err);
      setError(err.response?.data?.message || 'Error loading project');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError(null);
      
      console.log('📝 Updating project:', id, data);
      
      await updateProject(id, data);
      alert('Project updated successfully!');
      navigate('/admin/projects');
    } catch (err) {
      console.error('❌ Error updating project:', err);
      setError(err.response?.data?.message || 'Error updating project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Edit Project</h1>
        <p className="text-gray-400">Update project information</p>
      </div>

      {/* Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('name', { required: 'Project name is required' })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600 transition"
              placeholder="My Awesome Project"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Slug <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('slug', { 
                required: 'Slug is required',
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Only lowercase letters, numbers and hyphens allowed'
                }
              })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-purple-600 transition"
              placeholder="my-awesome-project"
            />
            {errors.slug && (
              <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>
            )}
            <p className="text-yellow-500 text-xs mt-1 flex items-center gap-1">
              ⚠️ Changing the slug will break existing links!
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600 transition resize-none"
              placeholder="Brief description of your project..."
            />
            <p className="text-gray-500 text-xs mt-1">
              Optional: A short description that will be shown in the projects list
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-300 font-medium mb-2">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-600 transition"
            >
              <option value="draft">Draft (Hidden from public)</option>
              <option value="published">Published (Visible to everyone)</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-neutral-800">
            <button
              type="submit"
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating...' : 'Update Project'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/projects')}
              className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;
