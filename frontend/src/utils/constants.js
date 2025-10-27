// API Base URL
export const API_BASE_URL = 'http://localhost:5000/api';

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