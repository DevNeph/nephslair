import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiTrash2, FiEye, FiToggleLeft, FiToggleRight, FiClock, FiLock } from 'react-icons/fi';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { request } from '../../../services/request';

const ManagePolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, pollId: null });

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await request(() => api.get('/polls/admin/all'), (msg) => toast.error(msg || 'Failed to load polls'));
      if (!response) return;
      setPolls(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pollId) => {
    await request(() => api.delete(`/polls/${pollId}`), (msg) => toast.error(msg || 'Failed to delete poll'));
    toast.success('Poll deleted successfully');
    fetchPolls();
    setDeleteModal({ show: false, pollId: null });
  };

  const togglePollStatus = async (pollId, currentStatus) => {
    await request(() => api.patch(`/polls/${pollId}/toggle`, { is_active: !currentStatus }), (msg) => toast.error(msg || 'Failed to update poll status'));
    toast.success(`Poll ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    fetchPolls();
  };

  const finalizePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to finalize this poll? This action cannot be undone!')) {
      return;
    }
    await request(() => api.patch(`/polls/${pollId}/finalize`), (msg) => toast.error(msg || 'Failed to finalize poll'));
    toast.success('Poll finalized successfully');
    fetchPolls();
  };

  const getTotalVotes = (poll) => {
    if (!poll.options) return 0;
    return poll.options.reduce((total, option) => total + (option.votes_count || 0), 0);
  };

  const isPollExpired = (poll) => {
    if (!poll.end_date) return false;
    return new Date(poll.end_date) < new Date();
  };

  const getTimeLeft = (endDate) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const formatTimeLeft = (timeLeft) => {
    if (!timeLeft) return null;
    
    const parts = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    if (timeLeft.hours > 0) parts.push(`${timeLeft.hours}h`);
    if (timeLeft.minutes > 0) parts.push(`${timeLeft.minutes}m`);
    if (timeLeft.seconds > 0 && timeLeft.days === 0) parts.push(`${timeLeft.seconds}s`);
    
    return parts.join(' ');
  };

  // Auto-refresh for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setPolls(prevPolls => [...prevPolls]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Manage Polls</h1>
          <p className="text-gray-400">View and manage all polls</p>
        </div>
        <Link
          to="/admin/polls/create"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          <FiBarChart2 />
          <span>Create Poll</span>
        </Link>
      </div>

      {/* Polls List */}
      {polls.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <FiBarChart2 className="text-gray-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No polls found</h3>
          <p className="text-gray-400 mb-6">Create your first poll</p>
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Poll Question
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Options
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Votes
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Time Left
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {polls.map((poll) => {
                  const timeLeft = poll.end_date ? getTimeLeft(poll.end_date) : null;
                  
                  return (
                    <tr key={poll.id} className="hover:bg-neutral-800/50 transition">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium max-w-md truncate">
                          {poll.question}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {poll.project ? (
                          <span className="text-cyan-400">Project</span>
                        ) : poll.post ? (
                          <span className="text-green-400">Post</span>
                        ) : (
                          <span className="text-purple-400">Homepage</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400">{poll.options?.length || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-purple-400 font-medium">{getTotalVotes(poll)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {poll.is_finalized ? (
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 text-sm font-medium">Finalized</span>
                          </div>
                        ) : isPollExpired(poll) ? (
                          <div className="flex items-center gap-2">
                            <FiClock className="text-orange-400 text-lg" />
                            <span className="text-orange-400 text-sm font-medium">Expired</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => togglePollStatus(poll.id, poll.is_active)}
                            className="flex items-center gap-2"
                          >
                            {poll.is_active ? (
                              <>
                                <FiToggleRight className="text-green-400 text-xl" />
                                <span className="text-green-400 text-sm font-medium">Active</span>
                              </>
                            ) : (
                              <>
                                <FiToggleLeft className="text-gray-400 text-xl" />
                                <span className="text-gray-400 text-sm font-medium">Inactive</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {poll.end_date ? (
                          timeLeft ? (
                            <span className="text-purple-400 text-sm font-mono">
                              {formatTimeLeft(timeLeft)}
                            </span>
                          ) : (
                            <span className="text-orange-400 text-sm">Expired</span>
                          )
                        ) : (
                          <span className="text-gray-500 text-sm">No limit</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!poll.is_finalized && (
                            <button
                              onClick={() => finalizePoll(poll.id)}
                              className="p-2 text-orange-400 hover:text-orange-300 hover:bg-neutral-800 rounded transition"
                              title="Finalize Poll"
                            >
                              <FiLock className="text-lg" />
                            </button>
                          )}
                          <Link
                            to={`/admin/polls/${poll.id}`}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-neutral-800 rounded transition"
                            title="View Details"
                          >
                            <FiEye className="text-lg" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ show: true, pollId: poll.id })}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-neutral-800 rounded transition"
                            title="Delete Poll"
                          >
                            <FiTrash2 className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete Poll</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this poll? This action cannot be undone and will also delete all votes.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDelete(deleteModal.pollId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteModal({ show: false, pollId: null })}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePolls;