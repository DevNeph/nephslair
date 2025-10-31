import api from './api';

// Public endpoints
export const getReleasesByProject = async (projectSlug) => {
  const response = await api.get(`/releases/project/${projectSlug}`);
  return response.data.data;
};

// Admin endpoints
export const getAllReleasesAdmin = async () => {
  const response = await api.get('/releases/admin/all');
  return response.data.data;
};

export const getReleasesByProjectIdAdmin = async (projectId) => {
  const response = await api.get(`/releases/admin/project/${projectId}`);
  return response.data.data;
};

export const getReleaseById = async (id) => {
  const response = await api.get(`/releases/admin/${id}`);
  return response.data.data;
};

export const createRelease = async (releaseData) => {
  const response = await api.post('/releases', releaseData);
  return response.data;
};

export const updateRelease = async (id, releaseData) => {
  const response = await api.put(`/releases/${id}`, releaseData);
  return response.data;
};

export const deleteRelease = async (id) => {
  const response = await api.delete(`/releases/${id}`);
  return response.data;
};

export const addFileToRelease = async (releaseId, fileData) => {
  const response = await api.post(`/releases/${releaseId}/files`, fileData);
  return response.data;
};

export const updateReleaseFile = async (fileId, fileData) => {
  const response = await api.put(`/releases/files/${fileId}`, fileData);
  return response.data;
};

export const deleteReleaseFile = async (fileId) => {
  const response = await api.delete(`/releases/files/${fileId}`);
  return response.data;
};

export const incrementDownloadCount = async (fileId) => {
  const response = await api.post(`/releases/files/${fileId}/download`);
  return response.data;
};

export const downloadFile = (fileId) => {
  // Use the same base URL logic as api.js
  const getBackendUrl = () => {
    // Check build-time environment variable first (from .env file)
    if (import.meta.env.VITE_API_BASE_URL) {
      const url = import.meta.env.VITE_API_BASE_URL.trim();
      // Remove /api suffix if present
      return url.endsWith('/api') ? url.slice(0, -4) : (url.endsWith('/') ? url.slice(0, -1) : url);
    }
    
    // Check runtime config (for production runtime overrides)
    if (typeof window !== 'undefined' && window.__APP_CONFIG__?.API_BASE_URL) {
      return window.__APP_CONFIG__.API_BASE_URL.replace('/api', '');
    }
    
    if (import.meta.env.MODE === 'production') {
      return window.location.origin;
    }
    
    return 'http://localhost:3001';
  };
  
  window.location.href = `${getBackendUrl()}/api/releases/download/${fileId}`;
};

/**
 * Get all release files (for dropdown/selection)
 */
export const getAllReleaseFiles = async (projectId = null) => {
  const params = projectId ? { project_id: projectId } : {};
  const response = await api.get('/release-files', { params });
  return response.data.data;
};

/**
 * Get release files by project
 */
export const getReleaseFilesByProject = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/release-files`);
  return response.data.data;
};