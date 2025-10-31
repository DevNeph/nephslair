// API Base URL
// Priority order:
// 1. Build-time env var (VITE_API_BASE_URL from .env) - highest priority
// 2. Runtime config (window.__APP_CONFIG__.API_BASE_URL) - for runtime overrides
// 3. Production: same origin + /api
// 4. Development: localhost:3001/api
export const API_BASE_URL = (() => {
  // Build-time environment variable (from .env file) - highest priority
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL.trim();
    // Ensure it ends with /api if not already
    return url.endsWith('/api') ? url : (url.endsWith('/') ? url + 'api' : url + '/api');
  }
  
  // Runtime config (from /config.js) - for production runtime overrides
  if (typeof window !== 'undefined' && window.__APP_CONFIG__?.API_BASE_URL) {
    return window.__APP_CONFIG__.API_BASE_URL;
  }
  
  // Production: same origin
  if (import.meta.env.MODE === 'production') {
    return (typeof window !== 'undefined' ? window.location.origin : '') + '/api';
  }
  
  // Development fallback
  return 'http://localhost:3001/api';
})();

// Local Storage Keys
export const TOKEN_KEY = 'nephslair_token';
export const USER_KEY = 'nephslair_user';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROJECT: '/project/:slug',
  POST: '/project/:slug/post/:postSlug',
  DOWNLOADS: '/project/:slug/downloads',
};

// Post vote types
export const VOTE_TYPES = {
  UPVOTE: 'upvote',
  DOWNVOTE: 'downvote',
};