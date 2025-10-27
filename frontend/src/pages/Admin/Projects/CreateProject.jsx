import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createProject } from '../../../services/projectService';
import ErrorMessage from '../../../components/common/ErrorMessage';

const CreateProject = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      status: 'draft'
    }
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Watch name field for auto-slug generation
  const nameValue = watch('name');

  // Auto-generate slug from name
  React.useEffect(() => {
    if (nameValue) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [nameValue, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      await createProject(data);
      alert('Project created successfully!');
      navigate('/admin/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Create New Project</h1>
        <p className="text-gray-400">Add a new project to your platform</p>
      </div>

      {/* Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
        {error && <ErrorMessage message={error} />}

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
            <p className="text-gray-500 text-xs mt-1">
              URL-friendly identifier (auto-generated from name)
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
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Project'}
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

export default CreateProject;