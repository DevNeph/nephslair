import api from './api';

// Public endpoints
export const getReleasesByProject = async (projectSlug) => {
  const response = await api.get(`/releases/project/${projectSlug}`);
  // Safely return data - ensure it's always an array
  return Array.isArray(response?.data?.data) ? response.data.data : [];
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
  // Use the same base URL logic as api.js, but remove /api suffix for direct file download
  const getBackendUrl = () => {
    // Check build-time environment variable first (from .env file)
    if (import.meta.env.VITE_API_BASE_URL) {
      let url = String(import.meta.env.VITE_API_BASE_URL).trim();
      // Remove /api suffix if present
      if (url.endsWith('/api')) {
        url = url.slice(0, -4);
      } else if (url.endsWith('/')) {
        url = url.slice(0, -1);
      }
      // Ensure it's an absolute URL
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        return url;
      }
    }
    
    // Check runtime config (for production runtime overrides)
    if (typeof window !== 'undefined' && window.__APP_CONFIG__?.API_BASE_URL) {
      let url = String(window.__APP_CONFIG__.API_BASE_URL).trim();
      // Remove /api suffix if present
      if (url.endsWith('/api')) {
        url = url.slice(0, -4);
      } else if (url.endsWith('/')) {
        url = url.slice(0, -1);
      }
      // Ensure it's an absolute URL
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        return url;
      }
    }
    
    // In production, use same origin (if backend is on same domain)
    if (import.meta.env.MODE === 'production' && typeof window !== 'undefined') {
      return window.location.origin;
    }
    
    // Development fallback
    return 'http://localhost:3001';
  };
  
  const backendUrl = getBackendUrl();
  // Ensure no double slashes and proper URL construction
  const downloadUrl = `${backendUrl.replace(/\/+$/, '')}/api/releases/download/${fileId}`;
  window.location.href = downloadUrl;
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