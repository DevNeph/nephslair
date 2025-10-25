import api from './api';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

/**
 * Register new user
 */
export const register = async (userData) => {
  console.log('📝 Attempting registration:', userData.email);
  const response = await api.post('/auth/register', userData);
  console.log('✅ Registration successful:', response.data);
  return response.data;
};

/**
 * Login user
 */
export const login = async (credentials) => {
  console.log('🔐 Attempting login:', credentials.email);
  
  const response = await api.post('/auth/login', credentials);
  
  // Backend response.data.data içinde token ve user bilgisi var
  const { token, ...user } = response.data.data;
  
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
    
    // GÜVENL İK KONTROLÜ
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      console.log('⚠️ No valid user in localStorage');
      return null;
    }
    
    const user = JSON.parse(userStr);
    console.log('👤 Current user from localStorage:', user);
    return user;
  } catch (error) {
    console.error('❌ Error parsing user from localStorage:', error);
    // Geçersiz veriyi temizle
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