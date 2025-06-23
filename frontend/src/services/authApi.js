import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

// Authentication service functions
export const authApi = {
  // User signup
  async signup(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SIGNUP, userData);
      return response.data;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  },

  // User login
  async login(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
      const { token } = response.data;

      // Store token in localStorage
      if (token) {
        localStorage.setItem('authToken', token);
      }

      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  // User logout
  async logout() {
    try {
      await apiClient.delete(API_ENDPOINTS.LOGOUT);
      // Clear token from localStorage
      localStorage.removeItem('authToken');
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      // Clear token even if API call fails
      localStorage.removeItem('authToken');
      throw error;
    }
  },

  // Get user profile
  async getUserProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_PROFILE);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(userData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USER_PROFILE, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!localStorage.getItem('authToken');
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('authToken');
  }
};

export default authApi;
