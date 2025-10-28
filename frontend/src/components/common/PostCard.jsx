import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

const PostCard = ({ post }) => {
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

      {/* Project Name */}
      <Link
        to={`/project/${post.project?.slug}`}
        className="inline-block text-base text-gray-400 hover:text-gray-300 mb-4"
      >
        {post.project?.name}
      </Link>

      {/* Divider */}
      <hr className="border-gray-700 my-4" />

      {/* Post Content/Excerpt */}
      <p className="text-gray-300 leading-relaxed mb-6">
        {post.excerpt || post.content?.substring(0, 300) + '...'}
      </p>

      {/* Divider */}
      <hr className="border-gray-700 my-4" />

      {/* Read More Link */}
      <Link
        to={`/project/${post.project?.slug}/post/${post.slug}`}
        className="flex justify-end items-center text-white hover:text-gray-400 transition"
      >
        Read more
        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
};

export default PostCard;