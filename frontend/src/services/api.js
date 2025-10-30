import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
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