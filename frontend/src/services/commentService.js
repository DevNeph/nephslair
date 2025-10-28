import api from './api';

/**
 * Get all comments (Admin only)
 */
export const getAllComments = async () => {
  const response = await api.get('/comments');
  return response.data.data;
};

/**
 * Get comments by post ID
 */
export const getCommentsByPost = async (postId) => {
  const response = await api.get(`/comments/post/${postId}`);
  return response.data.data;
};

/**
 * Create new comment
 */
export const createComment = async (commentData) => {
  const response = await api.post('/comments', commentData);
  return response.data.data;
};

/**
 * Update comment
 */
export const updateComment = async (id, content) => {
  const response = await api.put(`/comments/${id}`, { content });
  return response.data.data;
};

/**
 * Delete comment
 */
export const deleteComment = async (id) => {
  const response = await api.delete(`/comments/${id}`);
  return response.data;
};

/**
 * Vote on a comment
 */
export const voteComment = async (commentId, voteType) => {
  const response = await api.post(`/comments/${commentId}/vote`, { vote_type: voteType });
  return response.data.data;
};