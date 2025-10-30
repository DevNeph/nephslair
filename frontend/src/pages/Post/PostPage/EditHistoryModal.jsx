import React, { useState, useEffect } from 'react';
import { FiX, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import { request } from '../../../services/request';
import { formatDate } from '../../../utils/helpers';

const EditHistoryModal = ({ commentId, onClose }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await request(() => api.get(`/comments/${commentId}/history`), (msg) => toast.error('Failed to load edit history'));
        setHistory(response?.data?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [commentId]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">Edit History</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded transition">
            <FiX className="text-gray-400" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : history ? (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-green-400">CURRENT</span>
                  <FiClock className="text-gray-500" size={12} />
                  <span className="text-xs text-gray-500">Now</span>
                </div>
                <p className="text-sm text-white">{history.current}</p>
              </div>
              {history.history && history.history.length > 0 ? (
                history.history.map((item, index) => (
                  <div key={item.id} className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-400">
                        VERSION {history.history.length - index}
                      </span>
                      <FiClock className="text-gray-500" size={12} />
                      <span className="text-xs text-gray-500">
                        {formatDate(item.edited_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{item.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No edit history</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Failed to load history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditHistoryModal;
