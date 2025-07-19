import React, { useState } from 'react';
import apiClient from '../services/apiClient';
import './ProfileImageUpload.css';

const ProfileImageUpload = ({ currentImageUrl, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('profile_image', file);

      const response = await apiClient.post('/api/user/upload-profile-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Profile image updated successfully!');
      if (onImageUpdate && response.data.profile_image_url) {
        onImageUpdate(response.data.profile_image_url);
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Profile image upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-image-upload">
      <div className="current-image">
        {currentImageUrl ? (
          <img src={currentImageUrl} alt="Profile" className="profile-preview" />
        ) : (
          <div className="profile-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>

      <div className="upload-controls">
        <label htmlFor="profile-image-input" className="upload-btn">
          {uploading ? 'Uploading...' : 'Change Profile Image'}
        </label>
        <input
          id="profile-image-input"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
    </div>
  );
};

export default ProfileImageUpload;
