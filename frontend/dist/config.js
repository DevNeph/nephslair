// Runtime API Configuration
// This file is loaded before the app starts and sets the API base URL
// Only used if VITE_API_BASE_URL is not set in .env file
// Modify this file after deployment if backend URL changes (without rebuild)
window.__APP_CONFIG__ = {
  API_BASE_URL: 'https://api.nephslair.com/api'
};