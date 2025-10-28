import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiTrash2, FiSearch, FiExternalLink } from 'react-icons/fi';
import { getAllComments, deleteComment } from '../../../services/commentService';
import { getProjects } from '../../../services/projectService';
import Loading from '../../../components/common/Loading';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/helpers';

const ManageComments = () => {
  const [comments, setComments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    fetchComments();
    fetchProjects();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getAllComments();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

    const fetchProjects = async () => {
    try {
        const data = await getProjects();
        setProjects(data);
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
    };

  const filteredComments = comments.filter((comment) => {
    // Project filter
    if (selectedProject !== 'all' && comment.post?.project?.id !== parseInt(selectedProject)) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        comment.content.toLowerCase().includes(searchLower) ||
        comment.user?.username.toLowerCase().includes(searchLower) ||
        comment.post?.title.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const confirmDelete = (comment) => {
    setCommentToDelete(comment);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteComment(commentToDelete.id);
      toast.success('Comment deleted successfully');
      setShowDeleteModal(false);
      setCommentToDelete(null);
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Manage Comments</h1>
        <p className="text-gray-400">
          {filteredComments.length} comment{filteredComments.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by content, user, or post..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-10 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Project Filter */}
          <div className="relative">
            <FiMessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-10 py-2 text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <FiMessageSquare className="text-gray-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No comments found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedProject !== 'all'
              ? 'Try adjusting your filters'
              : 'No comments in the system'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    {/* User & Post Info */}
                    <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {comment.user?.username?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium">
                            {comment.user?.username || 'Anonymous'}
                        </span>
                        <span className="text-gray-500">commented on</span>
                        <Link
                            to={`/project/${comment.post?.project?.slug}/post/${comment.post?.slug}`}
                            className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                            {comment.post?.title}
                            <FiExternalLink size={14} />
                        </Link>
                        <span className="text-gray-500">in</span>
                        <span className="text-cyan-400 font-medium">
                            {comment.post?.project?.name}
                        </span>
                        </div>
                        <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                        </span>
                    </div>
                    </div>

                  {/* Comment Content */}
                  <p className="text-gray-300 mb-2">{comment.content}</p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => confirmDelete(comment)}
                  className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition"
                  title="Delete Comment"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Delete Comment</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="bg-neutral-800 rounded p-3 mb-6">
              <p className="text-gray-300 text-sm">{commentToDelete?.content}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCommentToDelete(null);
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

export default ManageComments;