import React, { useState, useEffect } from 'react';
import { FiCheck } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const PollWidget = ({ pollId, showResults = false }) => {
  const { user } = useAuth();
  const [poll, setPoll] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetchPoll();
    if (user) {
      fetchUserVote();
    }
  }, [pollId, user]);

  // Countdown Timer
  useEffect(() => {
    if (!poll?.end_date) return;

    const calculateTimeLeft = () => {
      const endTime = new Date(poll.end_date).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [poll?.end_date]);

  const fetchPoll = async () => {
    try {
      const response = await api.get(`/polls/${pollId}`);
      setPoll(response.data.data);
    } catch (error) {
      console.error('Error fetching poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVote = async () => {
    try {
      const response = await api.get(`/polls/${pollId}/my-vote`);
      if (response.data.data.voted) {
        setUserVote(response.data.data.poll_option_id);
      }
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const handleVote = async (optionId) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    if (!poll.is_active) {
      toast.error('This poll is no longer active');
      return;
    }

    try {
      setVoting(true);
      const response = await api.post(`/polls/${pollId}/vote`, {
        poll_option_id: optionId
      });
      
      if (response.data.data.poll_option_id === null) {
        toast.success('Vote removed!');
        setUserVote(null);
      } else {
        toast.success(userVote ? 'Vote updated!' : 'Vote submitted!');
        setUserVote(response.data.data.poll_option_id);
      }
      
      fetchPoll();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(error.response?.data?.message || 'Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  const getTotalVotes = () => {
    if (!poll?.options) return 0;
    return poll.options.reduce((total, option) => total + (option.votes_count || 0), 0);
  };

  const getPercentage = (votes) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return ((votes / total) * 100).toFixed(1);
  };

  const formatCountdown = () => {
    if (!timeLeft) return null;
    
    const parts = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    parts.push(`${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`);
    
    return parts.join(' ');
  };

  if (loading) {
    return (
      <div className="bg-black border border-gray-700 rounded-lg p-6 max-w-sm">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  const totalVotes = getTotalVotes();
  const hasVoted = userVote !== null || showResults;
  const isPollExpired = poll.end_date && new Date(poll.end_date) < new Date();
  const canVote = poll.is_active && !poll.is_finalized && !isPollExpired;

  return (
    <div className="bg-black border border-gray-700 rounded-lg p-6 max-w-sm">
      {/* Countdown Timer */}
      {timeLeft && canVote && (
        <div className="text-center mb-4">
          <div className="text-white text-2xl font-mono font-bold">
            {formatCountdown()}
          </div>
        </div>
      )}

      {/* Poll Header */}
      <h3 className="text-xl font-semibold text-white mb-6">{poll.question}</h3>

      {/* Poll Options */}
      <div className="space-y-3 mb-6">
        {poll.options && poll.options.map((option) => {
          const percentage = getPercentage(option.votes_count);
          const isSelected = userVote === option.id;

          return (
            <div key={option.id}>
              {hasVoted ? (
                // Results View
                <button
                  onClick={() => user && canVote && handleVote(option.id)}
                  disabled={!user || voting || !canVote}
                  className="w-full text-left border border-gray-700 rounded-lg p-3 hover:border-purple-500 transition disabled:cursor-not-allowed disabled:hover:border-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white">{option.option_text}</span>
                      {isSelected && <FiCheck className="text-purple-400" />}
                    </div>
                    <span className="text-purple-400 font-semibold">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </button>
              ) : (
                // Voting View
                <button
                  onClick={() => handleVote(option.id)}
                  disabled={voting || !canVote}
                  className="w-full text-left border border-gray-700 rounded-lg p-3 text-white hover:border-purple-500 hover:text-purple-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {option.option_text}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="text-gray-400 text-sm">
        {!user && !hasVoted ? (
          <p>Login to vote</p>
        ) : hasVoted ? (
          <div>
            <p className="mb-1">{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</p>
            {user && userVote && canVote && (
              <p className="text-xs">Click your vote to remove it</p>
            )}
          </div>
        ) : (
          <p>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</p>
        )}
        
        {/* Status Messages */}
        {poll.is_finalized && (
          <p className="text-red-400 text-xs mt-2">Poll closed</p>
        )}
        {isPollExpired && !poll.is_finalized && (
          <p className="text-orange-400 text-xs mt-2">Poll expired</p>
        )}
      </div>
    </div>
  );
};

export default PollWidget;