import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiFolderPlus, FiFileText, FiMessageSquare, FiPackage, FiBarChart2, FiSettings} from 'react-icons/fi';
import api from '../../../services/api';
import { request } from '../../../services/request';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    posts: 0,
    comments: 0,
    releases: 0,
    polls: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, projectsRes, postsRes, commentsRes, releasesRes, pollsRes] = await Promise.all([
        request(() => api.get('/users')),
        request(() => api.get('/projects')),
        request(() => api.get('/posts')),
        request(() => api.get('/comments')),
        request(() => api.get('/releases/admin/all')),
        request(() => api.get('/polls/admin/all')),
      ]);
      setStats({
        users: usersRes?.data?.data?.length || 0,
        projects: projectsRes?.data?.data?.length || 0,
        posts: postsRes?.data?.data?.length || 0,
        comments: commentsRes?.data?.data?.length || 0,
        releases: releasesRes?.data?.count || 0,
        polls: pollsRes?.data?.data?.length || 0
      });
    } catch (error) {
      // Console error only as before
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.users, 
      icon: FiUsers, 
      iconColor: 'text-purple-500',
      textColor: 'text-purple-500',
      link: '/admin/users' 
    },
    { 
      title: 'Total Projects', 
      value: stats.projects, 
      icon: FiFolderPlus, 
      iconColor: 'text-cyan-500',
      textColor: 'text-cyan-500',
      link: '/admin/projects' 
    },
    { 
      title: 'Total Posts', 
      value: stats.posts, 
      icon: FiFileText, 
      iconColor: 'text-green-500',
      textColor: 'text-green-500',
      link: '/admin/posts' 
    },
    { 
      title: 'Total Comments', 
      value: stats.comments, 
      icon: FiMessageSquare, 
      iconColor: 'text-yellow-500',
      textColor: 'text-yellow-500',
      link: '/admin/comments'
    },
    { 
      title: 'Total Releases', 
      value: stats.releases, 
      icon: FiPackage, 
      iconColor: 'text-blue-500',
      textColor: 'text-blue-500',
      link: '/admin/releases' 
    },
    { 
      title: 'Total Polls', 
      value: stats.polls, 
      icon: FiBarChart2, 
      iconColor: 'text-orange-500',
      textColor: 'text-orange-500',
      link: '/admin/polls' 
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Manage your platform from here</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`${stat.iconColor} text-3xl`} />
              <span className={`${stat.textColor} text-sm font-medium`}>
                View All
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.title}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to="/admin/projects/create"
            className="bg-neutral-800 hover:bg-neutral-700 rounded-lg p-4 text-center transition"
          >
            <FiFolderPlus className="text-purple-500 text-2xl mx-auto mb-2" />
            <span className="text-white font-medium">Create Project</span>
          </Link>
          <Link
            to="/admin/posts/create"
            className="bg-neutral-800 hover:bg-neutral-700 rounded-lg p-4 text-center transition"
          >
            <FiFileText className="text-purple-500 text-2xl mx-auto mb-2" />
            <span className="text-white font-medium">Create Post</span>
          </Link>
          <Link
            to="/admin/releases/create"
            className="bg-neutral-800 hover:bg-neutral-700 rounded-lg p-4 text-center transition"
          >
            <FiPackage className="text-purple-500 text-2xl mx-auto mb-2" />
            <span className="text-white font-medium">Create Release</span>
          </Link>
          <Link
            to="/admin/polls/create"
            className="bg-neutral-800 hover:bg-neutral-700 rounded-lg p-4 text-center transition"
          >
            <FiBarChart2 className="text-purple-500 text-2xl mx-auto mb-2" />
            <span className="text-white font-medium">Create Poll</span>
          </Link>
          <Link
            to="/admin/settings"
            className="bg-neutral-800 hover:bg-neutral-700 rounded-lg p-4 text-center transition"
          >
            <FiSettings className="text-purple-500 text-2xl mx-auto mb-2" />
            <span className="text-white font-medium">Site Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;