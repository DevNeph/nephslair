import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUp, FiArrowDown, FiMessageSquare, FiCalendar } from 'react-icons/fi';
import { formatRelativeTime, truncateText, getVoteCount } from '../../utils/helpers';

const PostCard = ({ post }) => {
  const voteCount = getVoteCount(post.upvotes, post.downvotes);
  const commentCount =
    post.commentCount ?? post.comments_count ?? post.comments?.length ?? 0;

  return (
    <div className="bg-gray-900 border border-white rounded-lg p-6 hover:border-gray-400 transition">
      {/* Project Name */}
      {post.project?.slug ? (
        <Link
          to={`/project/${post.project.slug}`}
          className="inline-block text-sm text-blue-400 hover:text-blue-300 mb-2"
        >
          {post.project?.name}
        </Link>
      ) : (
        <span className="inline-block text-sm text-gray-400 mb-2">
          {post.project?.name}
        </span>
      )}

      {/* Post Title */}
      {post.project?.slug ? (
        <Link to={`/project/${post.project.slug}/post/${post.slug}`}>
          <h2 className="text-2xl font-bold text-white mb-3 hover:text-gray-300 transition">
            {post.title}
          </h2>
        </Link>
      ) : (
        <h2 className="text-2xl font-bold text-white mb-3">{post.title}</h2>
      )}

      {/* Post Excerpt */}
      <p className="text-gray-400 mb-4 leading-relaxed">
        {truncateText(post.excerpt || post.content, 200)}
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
            <span>{commentCount}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1">
            <FiCalendar />
            <span>{formatRelativeTime(post.updated_at || post.published_at || post.created_at)}</span>
          </div>
        </div>

        {/* Read More Link */}
        {post.project?.slug ? (
          <Link
            to={`/project/${post.project.slug}/post/${post.slug}`}
            className="text-blue-400 hover:text-blue-300 transition font-medium"
          >
            Read More →
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default PostCard;