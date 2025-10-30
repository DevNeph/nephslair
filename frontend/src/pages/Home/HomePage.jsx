import React, { useState, useEffect } from 'react';
import { getAllPosts } from '../../services/postService';
import PostCard from '../../components/common/PostCard';
import PollWidget from '../../components/common/PollWidget';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import api from '../../services/api';
import { request } from '../../services/request';

const readSettings = () => {
  try { return JSON.parse(localStorage.getItem('website_settings') || '{}'); } catch { return {}; }
};

const ANNOUNCEMENT_KEY = 'announcement_dismissed_until';

const AnnouncementBar = () => {
  const settings = readSettings();
  const enabled = String(settings.announcement_enabled || 'false') === 'true';
  const text = settings.announcement_text || '';

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check persisted dismissal with expiry
    try {
      const raw = localStorage.getItem(ANNOUNCEMENT_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.expiresAt && data.text === text) {
          if (Date.now() < data.expiresAt) setVisible(false);
          else localStorage.removeItem(ANNOUNCEMENT_KEY);
        } else if (data && data.text !== text) {
          // New text -> reset
          localStorage.removeItem(ANNOUNCEMENT_KEY);
          setVisible(true);
        }
      }
    } catch {}
  }, [text]);

  if (!enabled || !text || !visible) return null;

  const dismissForOneHour = () => {
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    try { localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify({ text, expiresAt })); } catch {}
    setVisible(false);
  };

  return (
    <div className="mb-6 rounded-md border border-yellow-600/30 bg-yellow-900/20 text-yellow-300 px-4 py-3 flex items-start justify-between">
      <p className="text-sm leading-relaxed">{text}</p>
      <button
        className="ml-4 text-yellow-400 hover:text-yellow-300 text-sm"
        onClick={dismissForOneHour}
        title="Hide for 1 hour"
      >
        Dismiss
      </button>
    </div>
  );
};

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
      const postsData = await getAllPosts();
      setPosts(postsData);
      fetchPolls();
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchPolls = async () => {
    try {
      const response = await request(() => api.get('/polls/standalone'));
      setPolls(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  if (polls.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <AnnouncementBar />
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <AnnouncementBar />
      <div className="flex gap-8">
        <aside className="w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Community Polls</h2>
            {polls.map((poll) => (
              <PollWidget key={poll.id} pollId={poll.id} />
            ))}
          </div>
        </aside>

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