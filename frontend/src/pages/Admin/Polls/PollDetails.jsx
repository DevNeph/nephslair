import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiToggleLeft, FiToggleRight, FiExternalLink, FiLock, FiEdit2 } from 'react-icons/fi';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { request } from '../../../services/request';

const PollDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    fetchPollDetails();
  }, [id]);

  const fetchPollDetails = async () => {
    try {
      setLoading(true);
      const response = await request(() => api.get(`/polls/${id}`), (msg) => toast.error('Failed to load poll details'));
      if (!response) return;
      setPoll(response.data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    await request(() => api.delete(`/polls/${id}`), (msg) => toast.error(msg || 'Failed to delete poll'));
    toast.success('Poll deleted successfully');
    navigate('/admin/polls');
  };

  const togglePollStatus = async () => {
    await request(() => api.patch(`/polls/${id}/toggle`, {
      is_active: !poll.is_active
    }), (msg) => toast.error(msg || 'Failed to update poll status'));
    toast.success(`Poll ${!poll.is_active ? 'activated' : 'deactivated'} successfully`);
    fetchPollDetails();
  };

  const handleFinalize = async () => {
    if (!window.confirm('Are you sure you want to finalize this poll? This action cannot be undone and the poll cannot be reopened!')) {
      return;
    }
    await request(() => api.patch(`/polls/${id}/finalize`), (msg) => toast.error(msg || 'Failed to finalize poll'));
    toast.success('Poll finalized successfully');
    fetchPollDetails();
  };

  const getTotalVotes = () => {
    if (!poll?.options) return 0;
    return poll.options.reduce((total, option) => total + (option.vote_count || 0), 0);
  };

  const getPercentage = (votes) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return ((votes / total) * 100).toFixed(1);
  };

  const isPollExpired = () => {
    if (!poll?.end_date) return false;
    return new Date(poll.end_date) < new Date();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  const totalVotes = getTotalVotes();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/admin/polls"
        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition"
      >
        <FiArrowLeft />
        <span>Back to Polls</span>
      </Link>

      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{poll.question}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Poll ID: #{poll.id}</span>
              {poll.project && (
                <>
                  <span>•</span>
                  <span>Project: {poll.project.name}</span>
                </>
              )}
              <span>•</span>
              <span>Created: {new Date(poll.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
                  <Link
                      to={`/admin/polls/edit/${poll.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition"
                    >
                      <FiEdit2 />
                      <span>Edit</span>
                  </Link>
            {!poll.is_finalized && !isPollExpired() && (
              <button
                onClick={togglePollStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  poll.is_active
                    ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                    : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                }`}
              >
                {poll.is_active ? (
                  <>
                    <FiToggleRight className="text-xl" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <FiToggleLeft className="text-xl" />
                    <span>Inactive</span>
                  </>
                )}
              </button>
            )}
            
            {!poll.is_finalized && !isPollExpired() && (
              <button
                onClick={handleFinalize}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 rounded-lg transition"
              >
                <FiLock />
                <span>Finalize</span>
              </button>
            )}
            
            {poll.is_finalized && (
              <span className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg">
                <FiLock />
                <span>Finalized</span>
              </span>
            )}

            {isPollExpired() && !poll.is_finalized && (
              <span className="px-4 py-2 bg-orange-600/20 text-orange-400 rounded-lg">
                Expired
              </span>
            )}
            
            <button
              onClick={() => setDeleteModal(true)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-neutral-800 rounded transition"
              title="Delete Poll"
            >
              <FiTrash2 className="text-xl" />
            </button>
          </div>
        </div>

        {/* View Project Link */}
        {poll.project && (
          <Link
            to={`/project/${poll.project.slug || poll.project.id}`}
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition"
          >
            <FiExternalLink />
            <span>View Project</span>
          </Link>
        )}

        {/* Finalized Info */}
        {poll.is_finalized && poll.finalized_at && (
          <div className="mt-4 p-3 bg-red-600/10 border border-red-600/20 rounded-lg">
            <p className="text-red-400 text-sm">
              Finalized on {new Date(poll.finalized_at).toLocaleString()} - This poll cannot be reopened
            </p>
          </div>
        )}

        {/* End Date Info */}
        {poll.end_date && (
          <div className={`mt-4 p-3 rounded-lg ${
            isPollExpired() 
              ? 'bg-orange-600/10 border border-orange-600/20' 
              : 'bg-blue-600/10 border border-blue-600/20'
          }`}>
            <p className={`text-sm ${isPollExpired() ? 'text-orange-400' : 'text-blue-400'}`}>
              {isPollExpired() ? 'Expired' : 'Ends'} on {new Date(poll.end_date).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Votes</h3>
          <p className="text-3xl font-bold text-purple-400">{totalVotes}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Options</h3>
          <p className="text-3xl font-bold text-cyan-400">{poll.options?.length || 0}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm mb-2">Status</h3>
          <p className={`text-3xl font-bold ${
            poll.is_finalized ? 'text-red-400' : 
            isPollExpired() ? 'text-orange-400' :
            poll.is_active ? 'text-green-400' : 'text-gray-400'
          }`}>
            {poll.is_finalized ? 'Finalized' : 
             isPollExpired() ? 'Expired' :
             poll.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      {/* Poll Options with Results */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6">Poll Results</h2>
        <div className="space-y-4">
          {poll.options && poll.options.length > 0 ? (
            poll.options.map((option) => (
              <div key={option.id} className="bg-neutral-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{option.option_text}</span>
                  <div className="text-right">
                    <span className="text-purple-400 font-bold text-lg">
                      {getPercentage(option.vote_count)}%
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                      ({option.vote_count} {option.vote_count === 1 ? 'vote' : 'votes'})
                    </span>
                  </div>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(option.vote_count)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-8">No options available</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete Poll</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this poll? This action cannot be undone and will also delete all votes.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteModal(false)}
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

export default PollDetails;