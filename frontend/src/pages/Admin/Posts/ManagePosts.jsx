import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiSearch,
  FiFileText
} from 'react-icons/fi';
import api from '../../../services/api';
import Loading from '../../../components/common/Loading';
import toast from 'react-hot-toast';

const ManagePosts = () => {
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    fetchPosts();
    fetchProjects();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts/admin/all');
      console.log('🔍 Posts from API:', response.data.data);
      // Safely set posts - ensure it's always an array
      const postsData = response?.data?.data;
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/admin/all');
      console.log('🔍 Projects from API:', response.data.data);
      // Safely set projects - ensure it's always an array
      const projectsData = response?.data?.data;
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]); // Set empty array on error
    }
  };

  // Safely filter posts - ensure posts is an array
  const filteredPosts = (Array.isArray(posts) ? posts : []).filter((post) => {
    if (filter === 'published' && post.status !== 'published') return false;
    if (filter === 'draft' && post.status !== 'draft') return false;
    if (selectedProject !== 'all' && post.project_id !== parseInt(selectedProject))
      return false;
    if (searchTerm && !post.title.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    return true;
  });

  const toggleStatus = async (post) => {
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      await api.patch(`/posts/${post.id}`, { status: newStatus });
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      fetchPosts();
    } catch (error) {
      console.error('Error updating post status:', error);
      toast.error('Failed to update post status');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${postToDelete.id}`);
      toast.success('Post deleted successfully');
      setShowDeleteModal(false);
      setPostToDelete(null);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const confirmDelete = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Manage Posts</h1>
          <p className="text-gray-400">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Link
          to="/admin/posts/create"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <FiPlus /> Create Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-10 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-10 py-2 text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Project Filter */}
          <div className="relative">
            <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-10 py-2 text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="all">All Projects</option>
              {Array.isArray(projects) && projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Posts List */}
      {!Array.isArray(filteredPosts) || filteredPosts.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <FiFileText className="text-gray-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No posts found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filter !== 'all' || selectedProject !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first post to get started'}
          </p>
          {!searchTerm && filter === 'all' && selectedProject === 'all' && (
            <Link
              to="/admin/posts/create"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              <FiPlus /> Create Post
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{post.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        post.status === 'published'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <p className="text-purple-400 text-sm mb-2">
                        {(() => {
                            if (!Array.isArray(projects)) return 'Unknown Project';
                            const found = projects.find((p) => p.id == post.project_id);
                            return found?.name || 'Unknown Project';
                        })()}
                  </p>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {post.excerpt || 'No excerpt available'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                    {post.updated_at !== post.created_at && (
                      <span>Updated: {new Date(post.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(post)}
                    className={`p-2 rounded-lg transition ${
                      post.status === 'published'
                        ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                        : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                    }`}
                    title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                  >
                    {post.status === 'published' ? <FiEyeOff /> : <FiEye />}
                  </button>
                  <Link
                    to={`/admin/posts/edit/${post.id}`}
                    className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </Link>
                  <button
                    onClick={() => confirmDelete(post)}
                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Delete Post</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPostToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePosts;