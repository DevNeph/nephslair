import api from './api';

/**
 * Get all polls
 */
export const getAllPolls = async () => {
  const response = await api.get('/polls');
  return response.data.data;
};

/**
 * Get available polls (not attached to post)
 */
export const getAvailablePolls = async (projectId = null) => {
  const params = projectId ? { project_id: projectId } : {};
  const response = await api.get('/polls/available', { params });
  return response.data.data;
};

/**
 * Get poll by ID
 */
export const getPollById = async (id) => {
  const response = await api.get(`/polls/${id}`);
  return response.data.data;
};

/**
 * Create new poll (admin only)
 */
export const createPoll = async (pollData) => {
  const response = await api.post('/polls', pollData);
  return response.data.data;
};

/**
 * Update poll (admin only)
 */
export const updatePoll = async (id, pollData) => {
  const response = await api.put(`/polls/${id}`, pollData);
  return response.data.data;
};

/**
 * Delete poll (admin only)
 */
export const deletePoll = async (id) => {
  const response = await api.delete(`/polls/${id}`);
  return response.data;
};

/**
 * Vote on a poll
 */
export const votePoll = async (pollId, optionId) => {
  const response = await api.post(`/polls/${pollId}/vote`, { poll_option_id: optionId });
  return response.data.data;
};