import api from './api';

/**
 * Get all posts (from all projects)
 */
export const getAllPosts = async () => {
  const response = await api.get('/posts');
  // Safely return data - ensure it's always an array
  return Array.isArray(response?.data?.data) ? response.data.data : [];
};

/**
 * Get posts by project slug
 */
export const getPostsByProject = async (projectSlug) => {
  const response = await api.get(`/posts/project/${projectSlug}`);
  // Safely return data - ensure it's always an array
  return Array.isArray(response?.data?.data) ? response.data.data : [];
};

/**
 * Get single post by slug
 */
export const getPostBySlug = async (slug) => {
  const response = await api.get(`/posts/${slug}`);
  return response.data.data;
};

/**
 * Get single post by ID (Admin)
 */
export const getPostById = async (id) => {
  const response = await api.get(`/posts/admin/${id}`);
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
  const response = await api.post(`/posts/${postId}/vote`, { vote_type: voteType });
  return response.data.data;
};

/**
 * Add poll to post (admin only)
 */
export const addPollToPost = async (postId, pollId, displayOrder = 0) => {
  const response = await api.post(`/posts/${postId}/polls/${pollId}`, { display_order: displayOrder });
  return response.data;
};

/**
 * Remove poll from post (admin only)
 */
export const removePollFromPost = async (postId, pollId) => {
  const response = await api.delete(`/posts/${postId}/polls/${pollId}`);
  return response.data;
};

/**
 * Add download file to post (admin only)
 */
export const addDownloadToPost = async (postId, fileId, displayOrder = 0) => {
  const response = await api.post(`/posts/${postId}/downloads/${fileId}`, { display_order: displayOrder });
  return response.data;
};

/**
 * Remove download file from post (admin only)
 */
export const removeDownloadFromPost = async (postId, fileId) => {
  const response = await api.delete(`/posts/${postId}/downloads/${fileId}`);
  return response.data;
};

/**
 * Add release to post (admin only)
 */
export const addReleaseToPost = async (postId, releaseId, displayOrder = 0) => {
  const response = await api.post(`/posts/${postId}/releases/${releaseId}`, { display_order: displayOrder });
  return response.data;
};

/**
 * Remove release from post (admin only)
 */
export const removeReleaseFromPost = async (postId, releaseId) => {
  const response = await api.delete(`/posts/${postId}/releases/${releaseId}`);
  return response.data;
};