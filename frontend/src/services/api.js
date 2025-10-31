import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

// Determine API base URL with priority order:
// 1. Build-time env var (VITE_API_BASE_URL from .env) - highest priority
// 2. Runtime config (window.__APP_CONFIG__.API_BASE_URL) - for runtime overrides
// 3. Production: same origin + /api
// 4. Development: localhost:3001/api
const getApiBaseURL = () => {
  // Check build-time environment variable first (from .env file)
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL.trim();
    // Ensure it ends with /api if not already
    return url.endsWith('/api') ? url : (url.endsWith('/') ? url + 'api' : url + '/api');
  }
  
  // Check runtime config (loaded from /config.js) - for production runtime overrides
  // This check happens at request time, so config.js will be loaded
  if (typeof window !== 'undefined' && window.__APP_CONFIG__?.API_BASE_URL) {
    return window.__APP_CONFIG__.API_BASE_URL;
  }
  
  // In production, use same origin + /api (if backend is on same domain)
  if (import.meta.env.MODE === 'production') {
    return window.location.origin + '/api';
  }
  
  // Development fallback
  return 'http://localhost:3001/api';
};

const api = axios.create({
  baseURL: getApiBaseURL(), // Initial value (may be overridden by interceptor)
});

// Update baseURL dynamically on each request (for runtime config.js support)
api.interceptors.request.use((config) => {
  // Re-evaluate baseURL at request time to ensure config.js is loaded
  config.baseURL = getApiBaseURL();
  return config;
});

// Attach token if exists (skip for login/register)
api.interceptors.request.use((config) => {
  try {
    const url = (config.url || '').toLowerCase();
    const isAuthPath = url.includes('/auth/login') || url.includes('/auth/register');
    if (!isAuthPath) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (_) {}
  return config;
});

if (import.meta.env.MODE !== 'production') {
  api.interceptors.request.use((config) => {
    console.log('[API REQ]', config.method?.toUpperCase(), config.url, config.params || config.data);
    return config;
  });
  api.interceptors.response.use((res) => {
    console.log('[API RES]', res.status, res.config.url, res.data);
    return res;
  }, (err) => {
    return Promise.reject(err);
  });
}

export async function refreshSettingsCache() {
  try {
    const res = await api.get('/settings');
    localStorage.setItem('website_settings', JSON.stringify(res.data?.data || {}));
  } catch (_) {}
}

export default api;