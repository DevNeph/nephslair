import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowUp, FiArrowDown, FiCalendar, FiUser } from 'react-icons/fi';
import { getPostBySlug } from '../../services/postService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate, getVoteCount } from '../../utils/helpers';

const PostPage = () => {
  const { slug, postSlug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [postSlug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPostBySlug(postSlug);
      setPost(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!post) return <ErrorMessage message="Post not found" />;

  const voteCount = getVoteCount(post.upvotes, post.downvotes);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm">
        <Link to="/" className="text-blue-400 hover:text-blue-300">
          Home
        </Link>
        <span className="text-gray-500 mx-2">/</span>
        <Link to={`/project/${post.project?.slug}`} className="text-blue-400 hover:text-blue-300">
          {post.project?.name}
        </Link>
      </div>

      {/* Post Header */}
      <div className="bg-gray-900 border border-white rounded-lg p-8 mb-6">
        <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-6 text-sm text-gray-400 mb-6">
          <div className="flex items-center gap-2">
            <FiUser />
            <span>{post.author?.username || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar />
            <span>{formatDate(post.published_at || post.created_at)}</span>
          </div>
        </div>

        {/* Vote Section */}
        <div className="flex items-center gap-3 mb-6">
          <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
            <FiArrowUp className="text-green-500" size={20} />
          </button>
          <span className={`text-lg font-bold ${voteCount > 0 ? 'text-green-500' : voteCount < 0 ? 'text-red-500' : 'text-gray-400'}`}>
            {voteCount}
          </span>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
            <FiArrowDown className="text-red-500" size={20} />
          </button>
        </div>

        {/* Post Content */}
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-900 border border-white rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Comments</h2>
        
        {post.comments && post.comments.length > 0 ? (
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiUser className="text-gray-400" />
                  <span className="text-sm text-gray-400">{comment.user?.username}</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-gray-300">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default PostPage;