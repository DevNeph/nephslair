import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getProjectBySlug } from '../../services/projectService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate } from '../../utils/helpers';

const ProjectAboutPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await getProjectBySlug(slug);
      setProject(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading project');
    } finally {
      setLoading(false);
    }
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

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-black border border-gray-700 rounded-lg p-8">
            <h1 className="text-3xl font-normal text-white mb-6">About {project.name}</h1>
            
            {project.description ? (
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No description available for this project.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectAboutPage;