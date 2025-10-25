import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    console.log(`📡 ${config.method.toUpperCase()} ${config.url}`); // LOG EKLENDI
    
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.data); // LOG EKLENDI
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('nephslair_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;