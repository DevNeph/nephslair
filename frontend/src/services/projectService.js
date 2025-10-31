import api from './api';

/**
 * Get all published projects (Public)
 */
export const getProjects = async () => {
  const response = await api.get('/projects');
  // Safely return data - ensure it's always an array
  return Array.isArray(response?.data?.data) ? response.data.data : [];
};

/**
 * Get all projects including drafts (Admin only)
 */
export const getAllProjectsAdmin = async () => {
  const response = await api.get('/projects/admin/all');
  return response.data.data;
};

/**
 * Get project by ID (Admin only)
 */
export const getProjectById = async (id) => {
  const response = await api.get(`/projects/admin/${id}`);
  return response.data.data;
};

/**
 * Get project by slug
 */
export const getProjectBySlug = async (slug) => {
  const response = await api.get(`/projects/${slug}`);
  return response.data.data;
};

/**
 * Create new project (admin only)
 */
export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data.data;
};

/**
 * Update project (admin only)
 */
export const updateProject = async (id, projectData) => {
  const response = await api.put(`/projects/${id}`, projectData);
  return response.data.data;
};

/**
 * Delete project (admin only)
 */
export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};