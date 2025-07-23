import React, { createContext, useContext, useState, useEffect } from 'react';
import userPreferencesApi from '../services/userPreferencesApi';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState(null);

  // Load theme preference from server or localStorage on mount
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        setLoading(true);

        if (userPreferencesApi.isAuthenticated()) {
          // User is authenticated, try to load from server
          try {
            const userPrefs = await userPreferencesApi.getUserPreferences();
            setPreferences(userPrefs);

            // Set theme based on user preference
            const themePreference = userPrefs.theme;
            if (themePreference === 'auto') {
              // Use system preference for auto
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              setIsDarkMode(prefersDark);
            } else {
              setIsDarkMode(themePreference === 'dark');
            }
          } catch (error) {
            console.error('Failed to load user preferences from server:', error);
            // Fallback to cached preferences
            loadFromCache();
          }
        } else {
          // User not authenticated, load from localStorage
          loadFromCache();
        }
      } finally {
        setLoading(false);
      }
    };

    const loadFromCache = () => {
      const cachedPrefs = userPreferencesApi.getCachedPreferences();
      setPreferences(cachedPrefs);

      const themePreference = cachedPrefs.theme;
      if (themePreference === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
      } else {
        setIsDarkMode(themePreference === 'dark');
      }
    };

    loadThemePreferences();
  }, []);

  // Apply theme to document root and save preference
  useEffect(() => {
    if (loading) return; // Don't apply theme while loading

    const root = document.documentElement;
    const theme = isDarkMode ? 'dark' : 'light';

    root.setAttribute('data-theme', theme);

    // Update preferences
    if (preferences) {
      const updatedPrefs = { ...preferences, theme };
      setPreferences(updatedPrefs);

      // Save to server if authenticated, otherwise save to localStorage
      if (userPreferencesApi.isAuthenticated()) {
        userPreferencesApi.updateSinglePreference('theme', theme).catch(error => {
          console.error('Failed to save theme preference to server:', error);
          // Fallback to localStorage
          userPreferencesApi.setCachedPreference('theme', theme);
        });
      } else {
        userPreferencesApi.setCachedPreference('theme', theme);
      }
    }
  }, [isDarkMode, loading, preferences]);

  // Listen for system theme changes when preference is 'auto'
  useEffect(() => {
    if (preferences?.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        setIsDarkMode(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preferences?.theme]);

  const toggleTheme = async () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);

    // Update preferences object
    const updatedPrefs = { ...preferences, theme: newTheme };
    setPreferences(updatedPrefs);
  };

  const setTheme = async (theme) => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    } else {
      setIsDarkMode(theme === 'dark');
    }

    // Update preferences
    const updatedPrefs = { ...preferences, theme };
    setPreferences(updatedPrefs);

    // Save to server or localStorage
    if (userPreferencesApi.isAuthenticated()) {
      try {
        await userPreferencesApi.updateSinglePreference('theme', theme);
      } catch (error) {
        console.error('Failed to save theme preference:', error);
        userPreferencesApi.setCachedPreference('theme', theme);
      }
    } else {
      userPreferencesApi.setCachedPreference('theme', theme);
    }
  };

  const syncPreferences = async () => {
    if (userPreferencesApi.isAuthenticated()) {
      try {
        const synced = await userPreferencesApi.syncPreferences();
        setPreferences(synced);

        // Update theme based on synced preferences
        if (synced.theme === 'auto') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setIsDarkMode(prefersDark);
        } else {
          setIsDarkMode(synced.theme === 'dark');
        }

        return synced;
      } catch (error) {
        console.error('Failed to sync preferences:', error);
        throw error;
      }
    }
  };

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme,
    theme: isDarkMode ? 'dark' : 'light',
    preferences,
    setPreferences,
    loading,
    syncPreferences,
    // Expose preferences API for other components
    preferencesApi: userPreferencesApi
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
