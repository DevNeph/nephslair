import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getProjectBySlug } from '../../services/projectService';
import { getReleasesByProject } from '../../services/releaseService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate } from '../../utils/helpers';
import { FiChevronDown, FiChevronUp, FiDownload } from 'react-icons/fi';

const ProjectChangelogsPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState(new Set([0]));

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

  const toggleVersion = (index) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedVersions(newExpanded);
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

        {/* Main Content - Changelogs */}
        <main className="flex-1 min-w-0">
          {releases.length === 0 ? (
            <div className="bg-black border border-gray-700 rounded-lg p-8">
              <p className="text-gray-500 text-center">No releases yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {releases.map((release, index) => (
                <div
                  key={release.id}
                  className="bg-black border border-gray-700 rounded-lg overflow-hidden"
                >
                  {/* Version Header */}
                  <button
                    onClick={() => toggleVersion(index)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-900 transition"
                  >
                    <div className="flex items-center gap-3">
                      {expandedVersions.has(index) ? (
                        <FiChevronDown className="text-white" size={20} />
                      ) : (
                        <FiChevronUp className="text-white rotate-180" size={20} />
                      )}
                      <span className="text-2xl font-normal text-white">
                        V {release.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {release.files && release.files.length > 0 && (
                        <Link
                          to={`/project/${slug}/downloads#v${release.version}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                        >
                          <FiDownload size={16} />
                        </Link>
                      )}
                      <span className="text-gray-400 text-sm">
                        {formatDate(release.release_date)}
                      </span>
                    </div>
                  </button>

                  {/* Version Content */}
                  {expandedVersions.has(index) && (
                    <div className="px-6 pb-6 border-t border-gray-700">
                      {release.release_notes ? (
                        <div className="prose prose-invert max-w-none mt-4">
                          <div 
                            className="text-gray-300 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: release.release_notes.replace(/\n/g, '<br />') }}
                          />
                        </div>
                      ) : (
                        <p className="text-gray-500 italic mt-4">No release notes available</p>
                      )}


                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
        {/* Right Sidebar - Timeline */}
        <aside className="w-48 flex-shrink-0">
          <div className="sticky top-24">
            <div className="relative">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-700" />
              <div className="space-y-8">
                {releases.map((release) => (
                  <div key={release.id} className="relative pl-6">
                    <div className="absolute left-0 w-4 h-4 bg-white rounded-full border-4 border-black" />
                    <div>
                      <p className="text-white font-medium">V {release.version}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {formatDate(release.release_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProjectChangelogsPage;