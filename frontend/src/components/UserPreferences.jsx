import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './UserPreferences.css';

const UserPreferences = ({ isOpen, onClose }) => {
  const { preferences, setPreferences, preferencesApi, loading } = useTheme();
  const [localPrefs, setLocalPrefs] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (preferences) {
      setLocalPrefs({ ...preferences });
    }
  }, [preferences]);

  const handleChange = (key, value) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      if (preferencesApi.isAuthenticated()) {
        const updated = await preferencesApi.bulkUpdatePreferences(localPrefs);
        setPreferences(updated.preferences || localPrefs);
        setMessage('Preferences saved successfully!');
      } else {
        // Save to localStorage for non-authenticated users
        Object.keys(localPrefs).forEach(key => {
          preferencesApi.setCachedPreference(key, localPrefs[key]);
        });
        setPreferences(localPrefs);
        setMessage('Preferences saved locally!');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all preferences to defaults?')) {
      setSaving(true);
      try {
        if (preferencesApi.isAuthenticated()) {
          const resetData = await preferencesApi.resetUserPreferences();
          setPreferences(resetData.preferences);
          setLocalPrefs(resetData.preferences);
          setMessage('Preferences reset to defaults!');
        } else {
          const defaults = preferencesApi.getDefaultPreferences();
          setLocalPrefs(defaults);
          setPreferences(defaults);
          setMessage('Preferences reset to defaults locally!');
        }
      } catch (error) {
        console.error('Failed to reset preferences:', error);
        setMessage('Failed to reset preferences. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="preferences-overlay">
      <div className="preferences-modal">
        <div className="preferences-header">
          <h2>User Preferences</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {loading && <div className="loading">Loading preferences...</div>}

        <div className="preferences-content">
          {/* Theme and UI Preferences */}
          <div className="preference-section">
            <h3>Theme & Display</h3>

            <div className="preference-item">
              <label>Theme</label>
              <select
                value={localPrefs.theme || 'light'}
                onChange={(e) => handleChange('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div className="preference-item">
              <label>Font Size</label>
              <select
                value={localPrefs.font_size || 'medium'}
                onChange={(e) => handleChange('font_size', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra_large">Extra Large</option>
              </select>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={localPrefs.high_contrast || false}
                  onChange={(e) => handleChange('high_contrast', e.target.checked)}
                />
                High Contrast Mode
              </label>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={localPrefs.reduce_animations || false}
                  onChange={(e) => handleChange('reduce_animations', e.target.checked)}
                />
                Reduce Animations
              </label>
            </div>
          </div>

          {/* Language and Localization */}
          <div className="preference-section">
            <h3>Language & Region</h3>

            <div className="preference-item">
              <label>Language</label>
              <select
                value={localPrefs.language || 'en'}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            <div className="preference-item">
              <label>Time Format</label>
              <select
                value={localPrefs.time_format || '12h'}
                onChange={(e) => handleChange('time_format', e.target.value)}
              >
                <option value="12h">12 Hour</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
          </div>

          {/* Content Preferences */}
          <div className="preference-section">
            <h3>Content & Display</h3>

            <div className="preference-item">
              <label>Posts Per Page</label>
              <input
                type="number"
                min="5"
                max="100"
                value={localPrefs.posts_per_page || 10}
                onChange={(e) => handleChange('posts_per_page', parseInt(e.target.value))}
              />
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={localPrefs.show_profile_image !== false}
                  onChange={(e) => handleChange('show_profile_image', e.target.checked)}
                />
                Show Profile Images
              </label>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={localPrefs.auto_save_drafts !== false}
                  onChange={(e) => handleChange('auto_save_drafts', e.target.checked)}
                />
                Auto-save Drafts
              </label>
            </div>
          </div>

          {/* Privacy & Notifications */}
          <div className="preference-section">
            <h3>Privacy & Notifications</h3>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={localPrefs.show_online_status !== false}
                  onChange={(e) => handleChange('show_online_status', e.target.checked)}
                />
                Show Online Status
              </label>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={localPrefs.email_notifications !== false}
                  onChange={(e) => handleChange('email_notifications', e.target.checked)}
                />
                Email Notifications
              </label>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={localPrefs.browser_notifications || false}
                  onChange={(e) => handleChange('browser_notifications', e.target.checked)}
                />
                Browser Notifications
              </label>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={localPrefs.marketing_emails || false}
                  onChange={(e) => handleChange('marketing_emails', e.target.checked)}
                />
                Marketing Emails
              </label>
            </div>
          </div>

          {/* Editor Preferences */}
          <div className="preference-section">
            <h3>Editor</h3>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={localPrefs.auto_preview !== false}
                  onChange={(e) => handleChange('auto_preview', e.target.checked)}
                />
                Auto Preview
              </label>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={localPrefs.spell_check !== false}
                  onChange={(e) => handleChange('spell_check', e.target.checked)}
                />
                Spell Check
              </label>
            </div>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="preferences-actions">
          <button
            className="reset-btn"
            onClick={handleReset}
            disabled={saving}
          >
            Reset to Defaults
          </button>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;
