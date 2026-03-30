/**
 * Authentication Service
 * Handles login API calls and token management
 */

import { API_BASE_URL } from './api';

/**
 * Login user with userId and password
 * @param {string} userId - User ID
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response with user data and token
 */
export const loginUser = async (userId, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/loginBasedOnType`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        loginType: "IE", // Defaulting to IE for now as it matches the previous hardcoded logic
        loginId: userId,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.responseStatus?.message || 'Invalid login credentials');
    }

    if (data.responseStatus?.statusCode !== 0) {
      throw new Error(data.responseStatus?.message || 'Login failed');
    }

    return data.responseData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Store authentication data in localStorage
 * @param {Object} authData - Authentication data from login response
 */
export const storeAuthData = (authData) => {
  localStorage.setItem('authToken', authData.token);
  localStorage.setItem('userId', authData.userId);
  localStorage.setItem('userName', authData.userName);
  localStorage.setItem('roleName', authData.roleName);
  // Reset navigation to landing page upon login
  localStorage.setItem('activeMainView', 'Main Dashboard');
};

/**
 * Get stored authentication token
 * @returns {string|null} JWT token or null if not logged in
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Get stored user data
 * @returns {Object|null} User data or null if not logged in
 */
export const getStoredUser = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  return {
    userId: localStorage.getItem('userId'),
    userName: localStorage.getItem('userName'),
    roleName: localStorage.getItem('roleName'),
    vendorCode: localStorage.getItem('vendorCode'), // Allow components to easily read
    token: token,
  };
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Logout user - clear all auth data
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('roleName');
  // Reset navigation to landing page upon logout
  localStorage.setItem('activeMainView', 'Main Dashboard');
};
