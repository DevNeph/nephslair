import React, { useState, useEffect } from 'react';
import { getAllPosts } from '../../services/postService';
import PostCard from '../../components/common/PostCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPosts();
      setPosts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;