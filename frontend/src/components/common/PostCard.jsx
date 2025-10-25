import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUp, FiArrowDown, FiMessageSquare, FiCalendar } from 'react-icons/fi';
import { formatRelativeTime, truncateText, getVoteCount } from '../../utils/helpers';

const PostCard = ({ post }) => {
  const voteCount = getVoteCount(post.upvotes, post.downvotes);

  return (
    <div className="bg-gray-900 border border-white rounded-lg p-6 hover:border-gray-400 transition">
      {/* Project Name */}
      <Link
        to={`/project/${post.Project?.slug}`}
        className="inline-block text-sm text-blue-400 hover:text-blue-300 mb-2"
      >
        {post.Project?.name}
      </Link>

      {/* Post Title */}
      <Link to={`/project/${post.Project?.slug}/post/${post.id}`}>
        <h2 className="text-2xl font-bold text-white mb-3 hover:text-gray-300 transition">
          {post.title}
        </h2>
      </Link>

      {/* Post Excerpt */}
      <p className="text-gray-400 mb-4 leading-relaxed">
        {truncateText(post.content, 200)}
      </p>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          {/* Vote Count */}
          <div className="flex items-center gap-1">
            <FiArrowUp className="text-green-500" />
            <span className={voteCount > 0 ? 'text-green-500' : 'text-gray-500'}>
              {voteCount}
            </span>
            <FiArrowDown className="text-red-500" />
          </div>

          {/* Comment Count */}
          <div className="flex items-center gap-1">
            <FiMessageSquare />
            <span>{post.commentCount || 0}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1">
            <FiCalendar />
            <span>{formatRelativeTime(post.updatedAt)}</span>
          </div>
        </div>

        {/* Read More Link */}
        <Link
          to={`/project/${post.Project?.slug}/post/${post.id}`}
          className="text-blue-400 hover:text-blue-300 transition font-medium"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
};

export default PostCard;