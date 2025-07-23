import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

/**
 * User Preferences API Service
 * Handles all interactions with user preferences endpoints
 * Provides caching and fallback to localStorage for offline scenarios
 */

export const userPreferencesApi = {
  /**
   * Get user preferences from the server
   * Falls back to localStorage if user is not authenticated
   */
  async getUserPreferences() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_PREFERENCES);

      // Cache the preferences in localStorage for offline access
      if (response.data) {
        localStorage.setItem('userPreferences', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);

      // Fallback to localStorage if API fails
      const cachedPreferences = localStorage.getItem('userPreferences');
      if (cachedPreferences) {
        console.log('Using cached preferences from localStorage');
        return JSON.parse(cachedPreferences);
      }

      // Return default preferences if everything fails
      return this.getDefaultPreferences();
    }
  },

  /**
   * Update user preferences on the server
   * Also updates localStorage cache
   */
  async updateUserPreferences(preferences) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USER_PREFERENCES, preferences);

      // Update localStorage cache
      if (response.data) {
        localStorage.setItem('userPreferences', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      console.error('Error updating user preferences:', error);

      // If API fails, at least update localStorage
      localStorage.setItem('userPreferences', JSON.stringify(preferences));

      throw error;
    }
  },

  /**
   * Partially update user preferences (PATCH request)
   */
  async patchUserPreferences(partialPreferences) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.USER_PREFERENCES, partialPreferences);

      // Update localStorage cache
      if (response.data) {
        localStorage.setItem('userPreferences', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      console.error('Error patching user preferences:', error);

      // Merge with existing localStorage preferences if API fails
      const existing = this.getCachedPreferences();
      const merged = { ...existing, ...partialPreferences };
      localStorage.setItem('userPreferences', JSON.stringify(merged));

      throw error;
    }
  },

  /**
   * Bulk update multiple preference settings at once
   */
  async bulkUpdatePreferences(preferences) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.BULK_UPDATE_PREFERENCES, preferences);

      // Update localStorage cache
      if (response.data?.preferences) {
        localStorage.setItem('userPreferences', JSON.stringify(response.data.preferences));
      }

      return response.data;
    } catch (error) {
      console.error('Error bulk updating preferences:', error);

      // Fallback to localStorage
      const existing = this.getCachedPreferences();
      const merged = { ...existing, ...preferences };
      localStorage.setItem('userPreferences', JSON.stringify(merged));

      throw error;
    }
  },

  /**
   * Reset user preferences to default values
   */
  async resetUserPreferences() {
    try {
      const response = await apiClient.post(API_ENDPOINTS.RESET_PREFERENCES);

      // Update localStorage with reset preferences
      if (response.data?.preferences) {
        localStorage.setItem('userPreferences', JSON.stringify(response.data.preferences));
      }

      return response.data;
    } catch (error) {
      console.error('Error resetting user preferences:', error);

      // Fallback to default preferences in localStorage
      const defaultPrefs = this.getDefaultPreferences();
      localStorage.setItem('userPreferences', JSON.stringify(defaultPrefs));

      throw error;
    }
  },

  /**
   * Get user profile with embedded preferences
   */
  async getUserProfileWithPreferences() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_PROFILE_WITH_PREFERENCES);

      // Cache preferences separately
      if (response.data?.preferences) {
        localStorage.setItem('userPreferences', JSON.stringify(response.data.preferences));
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching user profile with preferences:', error);
      throw error;
    }
  },

  /**
   * Update a single preference setting
   * Optimized for quick theme/setting changes
   */
  async updateSinglePreference(key, value) {
    const preferences = { [key]: value };
    return this.patchUserPreferences(preferences);
  },

  /**
   * Get cached preferences from localStorage
   */
  getCachedPreferences() {
    try {
      const cached = localStorage.getItem('userPreferences');
      return cached ? JSON.parse(cached) : this.getDefaultPreferences();
    } catch (error) {
      console.error('Error reading cached preferences:', error);
      return this.getDefaultPreferences();
    }
  },

  /**
   * Get default preferences structure
   */
  getDefaultPreferences() {
    return {
      // Theme and UI Preferences
      theme: 'light',
      font_size: 'medium',
      high_contrast: false,
      reduce_animations: false,

      // Language and Localization
      language: 'en',
      timezone: 'UTC',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',

      // Content and Display Preferences
      posts_per_page: 10,
      show_profile_image: true,
      auto_save_drafts: true,

      // Privacy and Notification Preferences
      show_online_status: true,
      email_notifications: true,
      browser_notifications: false,
      marketing_emails: false,

      // Editor Preferences
      editor_theme: 'default',
      auto_preview: true,
      spell_check: true,

      // Custom JSON preferences
      custom_preferences: {}
    };
  },

  /**
   * Clear cached preferences
   */
  clearCachedPreferences() {
    localStorage.removeItem('userPreferences');
  },

  /**
   * Sync preferences between localStorage and server
   * Useful when coming back online
   */
  async syncPreferences() {
    try {
      const serverPrefs = await this.getUserPreferences();
      const localPrefs = this.getCachedPreferences();

      // Compare timestamps or use server preferences as source of truth
      // For now, server preferences take precedence
      localStorage.setItem('userPreferences', JSON.stringify(serverPrefs));

      return serverPrefs;
    } catch (error) {
      console.error('Error syncing preferences:', error);
      // Return cached preferences if sync fails
      return this.getCachedPreferences();
    }
  },

  /**
   * Check if user is authenticated (has authToken)
   */
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get preference value with fallback
   */
  getPreference(key, fallback = null) {
    const preferences = this.getCachedPreferences();
    return preferences[key] !== undefined ? preferences[key] : fallback;
  },

  /**
   * Set a preference in cache only (no server sync)
   * Useful for temporary/quick changes before batch update
   */
  setCachedPreference(key, value) {
    const preferences = this.getCachedPreferences();
    preferences[key] = value;
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }
};

export default userPreferencesApi;
