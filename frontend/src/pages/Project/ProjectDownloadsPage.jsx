import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getProjectBySlug } from '../../services/projectService';
import { getReleasesByProject, downloadFile } from '../../services/releaseService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate } from '../../utils/helpers';
import { FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProjectDownloadsPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectData, releasesData] = await Promise.all([
        getProjectBySlug(slug),
        getReleasesByProject(slug)
      ]);
      setProject(projectData);
      setReleases(releasesData);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

const handleDownload = async (file) => {
  try {
    downloadFile(file.id);
    toast.success('Download started!');
  } catch (error) {
    console.error('Error downloading:', error);
    toast.error('Failed to start download');
  }
};

  const getPlatforms = () => {
    const platforms = new Set();
    releases.forEach(release => {
      if (release.files) {
        release.files.forEach(file => {
          platforms.add(file.platform.toLowerCase());
        });
      }
    });
    return Array.from(platforms);
  };

  const filterFiles = (files) => {
    if (!files) return [];
    if (filter === 'all') return files;
    return files.filter(file => file.platform.toLowerCase() === filter);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!project) return <ErrorMessage message="Project not found" />;

  const navItems = [
    { label: 'Project Home Page', path: `/project/${slug}`, active: location.pathname === `/project/${slug}` },
    { label: 'About', path: `/project/${slug}/about`, active: location.pathname === `/project/${slug}/about` },
    { label: 'Downloads', path: `/project/${slug}/downloads`, active: location.pathname === `/project/${slug}/downloads` },
    { label: 'Changelogs', path: `/project/${slug}/changelogs`, active: location.pathname === `/project/${slug}/changelogs` }
  ];

  const platforms = getPlatforms();
  const hasDownloads = releases.some(r => r.files && r.files.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Left Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="bg-black border border-gray-700 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-normal text-white mb-4">
                {project.name}
              </h2>
              
              {project.version && (
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-1">Latest Version</p>
                  <p className="text-white">{project.version}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Publish Date</p>
                <p className="text-white">{formatDate(project.created_at)}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 rounded-lg transition ${
                    item.active
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-black border border-gray-700 rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-normal text-white">Downloads</h1>
              
              {/* Platform Filter */}
              {platforms.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition ${
                      filter === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    All
                  </button>
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setFilter(platform)}
                      className={`px-4 py-2 rounded-lg transition capitalize ${
                        filter === platform
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!hasDownloads ? (
              <div className="text-center py-12">
                <FiDownload className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500 text-lg">No downloads available yet</p>
                <p className="text-gray-600 text-sm mt-2">Check back later for project files and releases</p>
              </div>
            ) : (
              <div className="space-y-8">
                {releases.map((release) => {
                  const filteredFiles = filterFiles(release.files);
                  if (filteredFiles.length === 0) return null;

                  return (
                    <div key={release.id} id={`v${release.version}`}>
                      {/* Version Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl text-white font-medium">
                            Version {release.version}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            Released {formatDate(release.release_date)}
                          </p>
                        </div>
                        <Link
                          to={`/project/${slug}/changelogs#v${release.version}`}
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          View Changelog →
                        </Link>
                      </div>

                      {/* Files List - Full Width */}
                      <div className="space-y-2">
                        {filteredFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition"
                          >
                            <div className="flex items-center gap-6 flex-1">
                              <div className="flex-1">
                                <h4 className="text-white font-medium mb-1">
                                  {file.platform}
                                </h4>
                                <p className="text-gray-400 text-sm">
                                  {file.file_name}
                                </p>
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-4">
                                <span>{file.file_type?.toUpperCase()}</span>
                                <span>{(file.file_size / 1024 / 1024).toFixed(1)} MB</span>
                                <span>{file.download_count} downloads</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownload(file)}
                              className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition ml-6"
                            >
                              <FiDownload size={16} />
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectDownloadsPage;