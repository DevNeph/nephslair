import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import { getAllProjectsAdmin, deleteProject, updateProject } from '../../../services/projectService';
import Loading from '../../../components/common/Loading';
import ErrorMessage from '../../../components/common/ErrorMessage';

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllProjectsAdmin();
      console.log('📊 Projects loaded:', data);
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
      alert('Project deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting project');
    }
  };

  const handleToggleStatus = async (project) => {
    const newStatus = project.status === 'published' ? 'draft' : 'published';
    
    try {
      console.log(`🔄 Toggling status for project ${project.id}: ${project.status} → ${newStatus}`);
      
      await updateProject(project.id, { status: newStatus });
      
      // Update local state
      setProjects(projects.map(p => 
        p.id === project.id ? { ...p, status: newStatus } : p
      ));
      
      console.log('✅ Status updated successfully');
    } catch (err) {
      console.error('❌ Error updating status:', err);
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Manage Projects</h1>
          <p className="text-gray-400">Create and manage your projects</p>
        </div>
        <Link
          to="/admin/projects/create"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"
        >
          <FiPlus />
          Create Project
        </Link>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">No projects yet</p>
          <Link
            to="/admin/projects/create"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300"
          >
            <FiPlus />
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-800 border-b border-neutral-700">
              <tr>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Name</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Slug</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Status</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Posts</th>
                <th className="text-right px-6 py-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-neutral-800/50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-gray-500 truncate max-w-md">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono text-sm">
                    {project.slug}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(project)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        project.status === 'published'
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                      title={`Click to ${project.status === 'published' ? 'unpublish' : 'publish'}`}
                    >
                      {project.status === 'published' ? (
                        <>
                          <FiEye size={14} />
                          Published
                        </>
                      ) : (
                        <>
                          <FiEyeOff size={14} />
                          Draft
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {project.postCount || 0} posts
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/projects/edit/${project.id}`}
                        className="p-2 text-purple-400 hover:text-purple-300 hover:bg-neutral-700 rounded-lg transition"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-neutral-700 rounded-lg transition"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageProjects;