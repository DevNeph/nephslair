import api from './api';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

/**
 * Register new user
 */
export const register = async (userData) => {
  console.log('📝 Attempting registration:', userData.email);
  const response = await api.post('/auth/register', userData);

  // Safely access response data
  if (!response?.data?.data) {
    throw new Error('Invalid registration response');
  }

  const { token, ...user } = response.data.data;
  
  // Validate required fields
  if (!token || !user?.id) {
    throw new Error('Invalid registration data');
  }
  
  console.log('✅ Registration successful:', user);
  console.log('💾 Saving to localStorage...');
  
  // Save to localStorage
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  console.log('✅ Saved to localStorage');
  
  return { token, user };
};

/**
 * Login user
 */
export const login = async (credentials) => {
  console.log('🔐 Attempting login:', credentials.email);
  
  const response = await api.post('/auth/login', credentials);

  // Safely access response data
  if (!response?.data?.data) {
    throw new Error('Invalid login response');
  }

  const { token, ...user } = response.data.data;
  
  // Validate required fields
  if (!token || !user?.id) {
    throw new Error('Invalid login data');
  }
  
  console.log('✅ Login successful:', user);
  console.log('💾 Saving to localStorage...');
  
  // Save to localStorage
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  console.log('✅ Saved to localStorage');
  
  return { token, user };
};

/**
 * Logout user
 */
export const logout = () => {
  console.log('🚪 Logging out...');
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/';
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      console.log('⚠️ No valid user in localStorage');
      return null;
    }
    
    const user = JSON.parse(userStr);
    console.log('👤 Current user from localStorage:', user);
    return user;
  } catch (error) {
    console.error('❌ Error parsing user from localStorage:', error);
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!(token && token !== 'undefined' && token !== 'null');
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};