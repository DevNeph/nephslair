import React, { useState, useEffect } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { emitPollVote, onPollVote } from '../../utils/pollEvents'; // ✅ EKLE

const PostPolls = ({ polls }) => {
  const { user } = useAuth();
  const [voting, setVoting] = useState(null);
  const [pollsData, setPollsData] = useState(polls || []);

  useEffect(() => {
    setPollsData(polls || []);
  }, [polls]);

  // ✅ Listen for poll updates from other components
  useEffect(() => {
    const cleanup = onPollVote(async (event) => {
      const { pollId } = event.detail;
      
      // Check if this poll is in our list
      const pollExists = pollsData.find(p => p.id === pollId);
      if (pollExists) {
        try {
          const response = await api.get(`/polls/${pollId}`);
          const updatedPoll = response.data.data;
          
          setPollsData(prevPolls => 
            prevPolls.map(p => p.id === pollId ? updatedPoll : p)
          );
        } catch (error) {
          console.error('Error refreshing poll:', error);
        }
      }
    });

    return cleanup;
  }, [pollsData]);

  if (!polls || polls.length === 0) {
    return null;
  }

  const handleVote = async (pollId, optionId) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    try {
      setVoting(optionId);
      await api.post(`/polls/${pollId}/vote`, { poll_option_id: optionId });
      
      const response = await api.get(`/polls/${pollId}`);
      const updatedPoll = response.data.data;
      
      setPollsData(prevPolls => 
        prevPolls.map(p => p.id === pollId ? updatedPoll : p)
      );
      
      toast.success('Vote recorded!');
      
      // ✅ Notify other components
      emitPollVote(pollId);
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(error.response?.data?.message || 'Failed to vote');
    } finally {
      setVoting(null);
    }
  };

  const getTotalVotes = (options) => {
    return options.reduce((sum, opt) => sum + (parseInt(opt.vote_count) || 0), 0);
  };

  const getPercentage = (voteCount, totalVotes) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  return (
    <div className="space-y-6">
      {pollsData.map((poll) => {
        const totalVotes = getTotalVotes(poll.options || []);
        const hasVoted = user && poll.options?.some(opt => opt.user_has_voted);

        return (
          <div key={poll.id} className="bg-black border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">{poll.question}</h3>
            
            {poll.description && (
              <p className="text-sm text-gray-400 mb-4">{poll.description}</p>
            )}

            <div className="space-y-3 mb-4">
              {poll.options?.map((option) => {
                const voteCount = parseInt(option.vote_count) || 0;
                const percentage = getPercentage(voteCount, totalVotes);
                const isVoting = voting === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleVote(poll.id, option.id)}
                    disabled={!user || isVoting || poll.is_closed}
                    className={`w-full relative overflow-hidden rounded-lg border transition ${
                      poll.is_closed 
                        ? 'border-gray-700 cursor-not-allowed' 
                        : 'border-gray-700 hover:border-purple-500'
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-purple-600/20 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />

                    <div className="relative flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        {hasVoted && option.user_has_voted && (
                          <FiCheckCircle className="text-purple-400" size={18} />
                        )}
                        <span className="text-white font-medium">{option.option_text}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                          {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                        </span>
                        <span className="text-sm font-medium text-purple-400">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ✅ BURASI DEĞİŞTİ */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}</span>
              {poll.is_closed && (
                <span className="text-red-400">
                  {poll.is_finalized ? 'Poll finalized' : 'Poll closed'}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PostPolls;