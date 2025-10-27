import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectBySlug } from '../../services/projectService';
import { getPostsByProject } from '../../services/postService';
import PostCard from '../../components/common/PostCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const ProjectPage = () => {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjectAndPosts();
  }, [slug]);

  const fetchProjectAndPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projectData, postsData] = await Promise.all([
        getProjectBySlug(slug),
        getPostsByProject(slug)
      ]);
      
      setProject(projectData);
      setPosts(postsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!project) return <ErrorMessage message="Project not found" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Project Header */}
      <div className="mb-8">
        <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block">
          ← Back to all posts
        </Link>
        <h1 className="text-4xl font-bold text-white mb-3">{project.name}</h1>
        {project.description && (
          <p className="text-gray-400 text-lg">{project.description}</p>
        )}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts yet in this project</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectPage;