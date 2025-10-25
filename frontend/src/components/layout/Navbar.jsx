import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getProjects } from '../../services/projectService';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
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
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <Link to="/" className="text-xl font-bold text-white hover:text-gray-300 transition">
            Nephslair
          </Link>

          {/* Projects Dropdown - Center */}
          <div className="relative">
            <button
              onClick={() => setIsProjectsOpen(!isProjectsOpen)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Projects
              <FiChevronDown className={`transition-transform ${isProjectsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProjectsOpen && (
              <div className="absolute top-full mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2">
                {projects.length === 0 ? (
                  <div className="px-4 py-2 text-gray-500 text-sm">
                    No projects yet
                  </div>
                ) : (
                  projects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/project/${project.slug}`}
                      onClick={() => setIsProjectsOpen(false)}
                      className="block px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition"
                    >
                      <div className="font-medium">{project.name}</div>
                      {project.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {project.description}
                        </div>
                      )}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

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
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2">
                    <div className="px-4 py-2 border-b border-gray-800">
                      <p className="text-sm text-gray-500">Logged in as</p>
                      <p className="text-white font-medium">{user?.email}</p>
                      {user?.role === 'admin' && (
                        <span className="inline-block mt-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 transition flex items-center gap-2"
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
  );
};

export default Navbar;