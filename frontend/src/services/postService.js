import api from './api';

/**
 * Get all posts (from all projects)
 */
export const getAllPosts = async () => {
  const response = await api.get('/posts');
  return response.data.data;
};

/**
 * Get posts by project slug
 */
export const getPostsByProject = async (projectSlug) => {
  const response = await api.get(`/posts/project/${projectSlug}`);
  return response.data.data;
};

/**
 * Get single post by ID
 */
export const getPostById = async (id) => {
  const response = await api.get(`/posts/${id}`);
  return response.data.data;
};

/**
 * Create new post (admin only)
 */
export const createPost = async (postData) => {
  const response = await api.post('/posts', postData);
  return response.data.data;
};

/**
 * Update post (admin only)
 */
export const updatePost = async (id, postData) => {
  const response = await api.put(`/posts/${id}`, postData);
  return response.data.data;
};

/**
 * Delete post (admin only)
 */
export const deletePost = async (id) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

/**
 * Vote on a post
 */
export const votePost = async (postId, voteType) => {
  const response = await api.post(`/votes/${postId}`, { voteType });
  return response.data.data;
};