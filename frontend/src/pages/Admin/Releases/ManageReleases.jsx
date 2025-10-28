import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiDownload, FiEye } from 'react-icons/fi';
import { getAllReleasesAdmin, deleteRelease } from '../../../services/releaseService';
import Loading from '../../../components/common/Loading';
import { formatDate } from '../../../utils/helpers';
import toast from 'react-hot-toast';

const ManageReleases = () => {
  const navigate = useNavigate();
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('all');

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const data = await getAllReleasesAdmin();
      setReleases(data);
    } catch (error) {
      console.error('Error fetching releases:', error);
      toast.error('Failed to load releases');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, version) => {
    if (window.confirm(`Are you sure you want to delete version ${version}? This will also delete all associated files.`)) {
      try {
        await deleteRelease(id);
        toast.success('Release deleted successfully');
        fetchReleases();
      } catch (error) {
        console.error('Error deleting release:', error);
        toast.error(error.response?.data?.message || 'Failed to delete release');
      }
    }
  };

  const getUniqueProjects = () => {
    const projects = {};
    releases.forEach(release => {
      if (release.project) {
        projects[release.project.id] = release.project;
      }
    });
    return Object.values(projects);
  };

  const filteredReleases = filterProject === 'all'
    ? releases
    : releases.filter(r => r.project?.id === parseInt(filterProject));

  const projects = getUniqueProjects();

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Manage Releases</h1>
          <p className="text-gray-400">Create and manage version releases for projects</p>
        </div>
        <Link
          to="/admin/releases/create"
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
        >
          <FiPlus /> Create Release
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-gray-400 text-sm">Filter by Project:</label>
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <span className="text-gray-500 text-sm ml-auto">
          {filteredReleases.length} release{filteredReleases.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Releases List */}
      {filteredReleases.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No releases found</p>
          <Link
            to="/admin/releases/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
          >
            <FiPlus /> Create First Release
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReleases.map((release) => (
            <div
              key={release.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition"
            >
              <div className="flex items-start justify-between">
                {/* Release Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      v{release.version}
                    </h3>
                    {release.project && (
                      <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                        {release.project.name}
                      </span>
                    )}
                    {!release.is_published && (
                      <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-sm">
                        Draft
                      </span>
                    )}
                  </div>

                  <p className="text-gray-400 text-sm mb-3">
                    Released {formatDate(release.release_date)}
                  </p>

                  {/* Release Notes Preview */}
                  {release.release_notes && (
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                      {release.release_notes.substring(0, 150)}...
                    </p>
                  )}

                  {/* Files Count */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400 flex items-center gap-1">
                      <FiDownload size={14} />
                      {release.files?.length || 0} file{release.files?.length !== 1 ? 's' : ''}
                    </span>
                    {release.files && release.files.length > 0 && (
                      <span className="text-gray-500">
                        Total downloads: {release.files.reduce((sum, f) => sum + (f.download_count || 0), 0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {release.project && (
                    <Link
                      to={`/project/${release.project.slug}/changelogs`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                      title="View on site"
                    >
                      <FiEye size={18} />
                    </Link>
                  )}
                  <Link
                    to={`/admin/releases/edit/${release.id}`}
                    className="p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                    title="Edit"
                  >
                    <FiEdit2 size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(release.id, release.version)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Files Preview */}
              {release.files && release.files.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-800">
                  <div className="flex flex-wrap gap-2">
                    {release.files.map((file) => (
                      <div
                        key={file.id}
                        className="px-3 py-1 bg-neutral-800 rounded text-sm text-gray-400"
                      >
                        {file.platform} ({file.file_type})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageReleases;