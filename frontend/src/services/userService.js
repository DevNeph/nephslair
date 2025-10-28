import api from './api';

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data.data;
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
};

/**
 * Update user role (Admin only)
 */
export const updateUserRole = async (id, role) => {
  const response = await api.put(`/users/${id}/role`, { role });
  return response.data;
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};