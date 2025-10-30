import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getProjects } from '../../services/projectService';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [siteName, setSiteName] = useState('Nephslair');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const raw = localStorage.getItem('website_settings');
        if (raw) {
          const s = JSON.parse(raw);
          if (s.site_name) setSiteName(s.site_name);
        }
      } catch (_) {}
    };
    loadSettings();
    const onStorage = (e) => {
      if (e.key === 'website_settings') loadSettings();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  return (
    <>
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left */}
            <Link to="/" className="text-2xl font-bold text-white hover:text-gray-300 transition">
              {siteName}
            </Link>

            {/* Projects Dropdown Button - Center */}
            <button
              onClick={() => setIsProjectsOpen(!isProjectsOpen)}
              className="flex items-center gap-2 text-white text-lg font-medium hover:text-gray-300 transition"
            >
              Projects
              <FiChevronDown className={`transition-transform ${isProjectsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Menu - Right */}
            <div className="relative">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-gray-800"
                  >
                    <FiUser />
                    {user?.username}
                    <FiChevronDown className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl py-2">
                      <div className="px-4 py-2 border-b border-neutral-800">
                        <p className="text-sm text-gray-500">Logged in as</p>
                        <p className="text-white font-medium">{user?.email}</p>
                        {user?.role === 'admin' && (
                          <span className="inline-block mt-1 text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                      </div>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-4 py-2 text-purple-400 hover:bg-neutral-800 transition flex items-center gap-2"
                        >
                          <FiSettings />
                          Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-neutral-800 transition flex items-center gap-2"
                      >
                        <FiLogOut />
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Full Width Projects Dropdown */}
      {isProjectsOpen && (
        <>
          {/* Backdrop with Blur */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => setIsProjectsOpen(false)}
          />
          
          {/* Dropdown - Full Width, Centered Content */}
          <div className="fixed top-16 left-0 right-0 bg-black z-40">
            <div className="max-w-4xl mx-auto px-8 py-12">
              <div className="space-y-8 text-center">
                {/* All Posts Link - En üstte */}
                <Link
                  to="/"
                  onClick={() => setIsProjectsOpen(false)}
                  className="block text-white hover:text-gray-400 transition"
                >
                  <h3 className="text-3xl font-normal">
                    All Posts
                  </h3>
                </Link>

                {/* Divider */}
                {projects.length > 0 && (
                  <hr className="border-gray-800" />
                )}

                {/* Projects List */}
                {projects.length === 0 ? (
                  <div className="py-4">
                    <p className="text-gray-500 text-lg">No projects yet</p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/project/${project.slug}`}
                      onClick={() => setIsProjectsOpen(false)}
                      className="block text-white hover:text-gray-400 transition"
                    >
                      <h3 className="text-3xl font-normal">
                        {project.name}
                      </h3>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;