import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [downvotes, setDownvotes] = useState(post.downvotes || 0);
  const [voting, setVoting] = useState(false);
  
  const voteCount = upvotes - downvotes;
  const commentsCount = post.comments_count || 0;

  const handleVote = async (voteType) => {
    // Auth kontrolü
    if (!user) {
      toast.error('Please login to vote');
      navigate('/login');
      return;
    }

    if (voting) return;

    try {
      setVoting(true);
      
      const response = await api.post(`/posts/${post.id}/vote`, {
        vote_type: voteType
      });

      // Backend'den güncel vote sayılarını al
      if (response.data.success) {
        setUpvotes(response.data.data.upvotes);
        setDownvotes(response.data.data.downvotes);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="bg-black border border-gray-700 rounded-lg p-8 hover:border-gray-500 transition">
      {/* Date - Top Right */}
      <div className="flex justify-end mb-4">
        <span className="text-sm text-gray-500">
          {formatDate(post.published_at || post.updated_at || post.created_at)}
        </span>
      </div>

      {/* Post Title */}
      <h2 className="text-3xl font-normal text-white mb-2">
        {post.title}
      </h2>

      {/* Project Name or Badge */}
      {post.project ? (
        <Link
          to={`/project/${post.project.slug}`}
          className="inline-block text-base text-gray-400 hover:text-gray-300 mb-4"
        >
          {post.project.name}
        </Link>
      ) : (
        <span className="inline-block text-base text-gray-400 mb-4">
          General Feed
        </span>
      )}

      {/* Divider */}
      <hr className="border-gray-700 my-4" />

      {/* Post Content/Excerpt */}
      <p className="text-gray-300 leading-relaxed mb-6">
        {post.excerpt || post.content?.substring(0, 300) + '...'}
      </p>

      {/* Divider */}
      <hr className="border-gray-700 my-4" />

      {/* Footer - Vote, Comments and Read More */}
      <div className="flex justify-between items-center">
        {/* Left side - Vote and Comments */}
        <div className="flex items-center gap-4">
          {/* Vote Count */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleVote('upvote')}
              disabled={voting}
              className="text-gray-400 hover:text-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              title={user ? 'Upvote' : 'Login to vote'}
            >
              <FiArrowUp size={24} />
            </button>
            <span className={`text-sm font-medium ${
              voteCount > 0 ? 'text-green-500' : voteCount < 0 ? 'text-red-500' : 'text-gray-400'
            }`}>
              {voteCount}
            </span>
            <button
              onClick={() => handleVote('downvote')}
              disabled={voting}
              className="text-gray-400 hover:text-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              title={user ? 'Downvote' : 'Login to vote'}
            >
              <FiArrowDown size={24} />
            </button>
          </div>

          {/* Comment Count */}
          <div className="flex items-center gap-1.5 text-gray-400">
            <FiMessageCircle size={18} />
            <span className="text-sm">{commentsCount}</span>
          </div>
        </div>

        {/* Right side - Read More Link */}
        <Link
          to={post.project 
            ? `/project/${post.project.slug}/post/${post.slug}`
            : `/post/${post.slug}`
          }
          className="flex items-center text-white hover:text-gray-400 transition"
        >
          Read more
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default PostCard;