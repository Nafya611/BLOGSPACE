import React, { useState, useEffect } from 'react';
import { blogApi } from '../services/blogApi';
import './EditPost.css';

const EditPost = ({ post, onPostUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tag: [],
    image: null
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        category: typeof post.category === 'object' && post.category ? post.category.id : post.category || '',
        tag: Array.isArray(post.tag) ? post.tag.map(t => typeof t === 'object' ? t.id : t) : [],
        image: null // Keep as null for new image uploads
      });
    }
  }, [post]);

  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          blogApi.getCategories(),
          blogApi.getTags()
        ]);
        setCategories(categoriesData || []);
        setTags(tagsData || []);
      } catch (error) {
        console.error('Error fetching categories and tags:', error);
        setError('Failed to load categories and tags');
      }
    };

    fetchCategoriesAndTags();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTagChange = (e) => {
    const { value, checked } = e.target;
    const tagId = parseInt(value);

    setFormData(prev => ({
      ...prev,
      tag: checked
        ? [...prev.tag, tagId]
        : prev.tag.filter(id => id !== tagId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let updatedPost;

      // Check if we have a new image to upload
      const hasNewImage = formData.image && formData.image instanceof File;

      if (hasNewImage) {
        // Use FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('content', formData.content);
        formDataToSend.append('image', formData.image);

        if (formData.category) {
          const selectedCategory = categories.find(cat => cat.id === parseInt(formData.category));
          if (selectedCategory) {
            formDataToSend.append('category', JSON.stringify({
              name: selectedCategory.name,
              slug: selectedCategory.slug
            }));
          }
        }

        if (formData.tag.length > 0) {
          const tagData = [];
          for (const tagId of formData.tag) {
            const selectedTag = tags.find(tag => tag.id === tagId);
            if (selectedTag) {
              tagData.push({
                name: selectedTag.name,
                slug: selectedTag.slug
              });
            }
          }
          if (tagData.length > 0) {
            formDataToSend.append('tag', JSON.stringify(tagData));
          }
        }

        updatedPost = await blogApi.updatePost(post.slug, formDataToSend);
      } else {
        // Use regular JSON for updates without new images
        const updateData = {
          title: formData.title,
          content: formData.content
        };

        if (formData.category) {
          const selectedCategory = categories.find(cat => cat.id === parseInt(formData.category));
          if (selectedCategory) {
            updateData.category = {
              name: selectedCategory.name,
              slug: selectedCategory.slug
            };
          }
        }

        if (formData.tag.length > 0) {
          const tagData = [];
          for (const tagId of formData.tag) {
            const selectedTag = tags.find(tag => tag.id === tagId);
            if (selectedTag) {
              tagData.push({
                name: selectedTag.name,
                slug: selectedTag.slug
              });
            }
          }
          updateData.tag = tagData;
        }

        updatedPost = await blogApi.updatePost(post.slug, updateData);
      }

      if (onPostUpdated) {
        onPostUpdated(updatedPost);
      }
    } catch (err) {
      let errorMessage = 'Failed to update post. Please try again.';

      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(errors)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          }
          errorMessage = errorMessages.join('\n');
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-post">
      <div className="edit-post-header">
        <h3>Edit Post</h3>
        <button
          onClick={onCancel}
          className="cancel-btn"
          type="button"
        >
          ✕
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="edit-post-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="6"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Update Image:</label>
          {post.image && (
            <div className="current-image">
              <p>Current image:</p>
              <img
                src={post.image}
                alt="Current post image"
                style={{ maxWidth: '200px', maxHeight: '150px', marginBottom: '10px' }}
              />
            </div>
          )}
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleChange}
            accept="image/*"
            disabled={loading}
          />
          {formData.image && (
            <div className="image-preview">
              <p>New image preview:</p>
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Preview"
                style={{ maxWidth: '200px', maxHeight: '150px', marginTop: '10px' }}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tags:</label>
          <div className="tags-list">
            {tags.map((tag) => (
              <label key={tag.id} className="tag-checkbox">
                <input
                  type="checkbox"
                  value={tag.id}
                  checked={formData.tag.includes(tag.id)}
                  onChange={handleTagChange}
                  disabled={loading}
                />
                <span>{tag.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="save-btn"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Post'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;
