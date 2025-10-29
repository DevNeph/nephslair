import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  const [expandedVersions, setExpandedVersions] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, [slug]);

  useEffect(() => {
  // /project/myproj/changelogs#v1.2.3  -> "1.2.3" open that version
  const hash = location.hash;
  if (hash && hash.startsWith('#v')) {
    const versionFromHash = decodeURIComponent(hash.slice(2));
    const idx = releases.findIndex(r => r.version === versionFromHash);
    if (idx !== -1) {
      setExpandedVersions(new Set([idx]));
    }
  }
}, [location.hash, releases]);

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
              
              {/* ✅ Latest Version yerine project.version */}
              {project.latest_version && (
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-1">Latest Version</p>
                  <p className="text-white">{project.latest_version}</p>
                </div>
              )}
              
              {/* ✅ Last Updated yerine Publish Date */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                <p className="text-white">{formatDate(project.updated_at)}</p>
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
                        <FiChevronUp className="text-white" size={20} />
                      ) : (
                        <FiChevronDown className="text-white" size={20} />
                      )}
                      <span className="text-2xl font-normal text-white">
                        {release.version}
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
                      <div className="mt-6">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          className="prose prose-invert max-w-none"
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white border-b border-gray-600 pb-2 mb-4 mt-6" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white border-b border-gray-700 pb-2 mb-3 mt-5" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mb-2 mt-4" {...props} />,
                            h4: ({node, ...props}) => <h4 className="text-lg font-bold text-white mb-2 mt-3" {...props} />,
                            p: ({node, ...props}) => <p className="text-gray-300 my-3 leading-relaxed" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-6 my-4 text-gray-300" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-4 text-gray-300" {...props} />,
                            li: ({node, ...props}) => <li className="my-2" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                            code: ({node, inline, ...props}) => 
                              inline ? 
                                <code className="bg-black text-purple-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props} /> :
                                <code className="block bg-black border border-gray-700 rounded p-4 my-4 overflow-x-auto text-sm" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 my-4" {...props} />,
                          }}
                        >
                          {release.release_notes}
                        </ReactMarkdown>
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