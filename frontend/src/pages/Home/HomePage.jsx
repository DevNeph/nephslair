import React, { useState, useEffect } from 'react';
import { getAllPosts } from '../../services/postService';
import PostCard from '../../components/common/PostCard';
import PollWidget from '../../components/common/PollWidget';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import api from '../../services/api';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch posts
      const postsData = await getAllPosts();
      setPosts(postsData);

      // Fetch homepage polls (standalone polls)
      fetchPolls();
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchPolls = async () => {
    try {
      const response = await api.get('/polls/standalone');
      setPolls(response.data.data || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
      // Don't show error to user, just log it
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  // If no polls, show posts only (current layout)
  if (polls.length === 0) {
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
  }

  // If polls exist, show sidebar layout
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex gap-8">
        {/* Left Sidebar - Polls */}
        <aside className="w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Community Polls</h2>
            {polls.map((poll) => (
              <PollWidget key={poll.id} pollId={poll.id} />
            ))}
          </div>
        </aside>

        {/* Main Content - Posts */}
        <main className="flex-1 min-w-0">
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
        </main>
      </div>
    </div>
  );
};

export default HomePage;