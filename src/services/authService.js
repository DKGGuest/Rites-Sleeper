/**
 * Authentication Service
 * Handles login API calls and token management
 */

// Use the exact same base URL as in api.js
const API_BASE_URL = 'https://sarthibackendservice-bfe2eag3byfkbsa6.canadacentral-01.azurewebsites.net/sarthi-backend/api';

/**
 * Hardcoded credentials for Sleeper users (re-added for parity)
 */
const HARDCODED_USERS = {
  'sleeper': {
    password: 'password',
    userData: {
      userId: 'sleeper',
      userName: 'Sleeper Officer',
      roleName: 'SLEEPER',
      token: 'sleeper-mock-token-' + Date.now()
    }
  },
  'Sleeper': {
    password: 'password',
    userData: {
      userId: 'Sleeper',
      userName: 'Sleeper Officer',
      roleName: 'SLEEPER',
      token: 'sleeper-mock-token-' + Date.now()
    }
  }
};

/**
 * Login user with userId and password
 * @param {string} userId - User ID
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response with user data and token
 */
export const loginUser = async (userId, password) => {
  // Check for hardcoded credentials first
  if (HARDCODED_USERS[userId]) {
    if (HARDCODED_USERS[userId].password === password) {
      console.log(`✅ Hardcoded login successful for ${userId}`);
      return HARDCODED_USERS[userId].userData;
    } else {
      throw new Error('Invalid password');
    }
  }

  // Fallback to real API if needed (though predominantly uses hardcoded for now)
  try {
    const response = await fetch(`${API_BASE_URL}/auth/loginBasedOnType`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        loginType: "IE",
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
};
