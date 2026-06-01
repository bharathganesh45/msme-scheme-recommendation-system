import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to headers if it exists
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const authAPI = {
  // Sign up new user
  signup: async (userData) => {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      if (response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      if (response.data.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('authToken');
  },

  // Get stored user
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Request password reset (send OTP)
  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post('/auth/reset-password/request', { email });
      return response.data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },

  // Verify OTP for password reset
  verifyPasswordResetOTP: async (email, otp) => {
    try {
      const response = await apiClient.post('/auth/reset-password/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email, otp, newPassword, confirmPassword) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword, 
        confirmPassword 
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },
};

// Schemes collection endpoints
export const collectionAPI = {
  // Save a scheme to collection
  saveScheme: async (schemeId) => {
    try {
      const response = await apiClient.post('/users/schemes/save', { scheme_id: schemeId });
      return response.data;
    } catch (error) {
      console.error('Error saving scheme:', error);
      throw error;
    }
  },

  // Remove scheme from collection
  unsaveScheme: async (schemeId) => {
    try {
      const response = await apiClient.delete(`/users/schemes/save/${schemeId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing scheme:', error);
      throw error;
    }
  },

  // Get all saved schemes for current user
  getSavedSchemes: async () => {
    try {
      const response = await apiClient.get('/users/schemes/saved');
      return response.data;
    } catch (error) {
      console.error('Error fetching saved schemes:', error);
      throw error;
    }
  },

  // Check if a scheme is saved
  isSchemeSaved: async (schemeId) => {
    try {
      const response = await apiClient.get(`/users/schemes/save/${schemeId}`);
      return response.data;
    } catch (error) {
      return { success: false, data: { isSaved: false } };
    }
  },
};

// Scheme endpoints
export const schemeAPI = {
  // Get all schemes
  getAllSchemes: async () => {
    try {
      const response = await apiClient.get('/schemes');
      return response.data;
    } catch (error) {
      console.error('Error fetching schemes:', error);
      throw error;
    }
  },

  // Get scheme by ID
  getSchemeById: async (id) => {
    try {
      const response = await apiClient.get(`/schemes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching scheme:', error);
      throw error;
    }
  },

  // Get recommended schemes based on user data
  recommendSchemes: async (userData) => {
    try {
      const response = await apiClient.post('/schemes/recommend', userData);
      return response.data;
    } catch (error) {
      console.error('Error getting scheme recommendations:', error);
      throw error;
    }
  },


};

export default apiClient;
