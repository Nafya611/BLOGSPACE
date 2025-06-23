import React, { useState, useEffect } from 'react';
import { blogApi } from '../services/blogApi';

const CreatePost = ({ onPostCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tag: [],
    status: 'draft', // draft or published
    image: null
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newTag, setNewTag] = useState('');

  // Fetch categories and tags on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          blogApi.getCategories(),
          blogApi.getTags()
        ]);
        setCategories(categoriesData || []);
        setTags(tagsData || []);
      } catch (error) {
        console.error('Error fetching categories and tags:', error);
      }
    };

    fetchData();
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

  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tag: prev.tag.includes(tagId)
        ? prev.tag.filter(id => id !== tagId)
        : [...prev.tag, tagId]
    }));
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !tags.find(tag => tag.name.toLowerCase() === newTag.toLowerCase())) {
      // In a real app, you'd want to create the tag via API first
      const tempTag = {
        id: `temp-${Date.now()}`,
        name: newTag.trim()
      };
      setTags(prev => [...prev, tempTag]);
      setFormData(prev => ({
        ...prev,
        tag: [...prev.tag, tempTag.id]
      }));
      setNewTag('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');    try {      // Prepare the post data
      const postData = {
        title: formData.title,
        content: formData.content,
        is_published: formData.status === 'published',
        is_draft: formData.status === 'draft'
      };      // Add category if selected
      if (formData.category) {
        const selectedCategory = categories.find(cat => cat.id === formData.category);
        if (selectedCategory) {
          postData.category = {
            name: selectedCategory.name,
            slug: selectedCategory.slug
          };
        }
      }// Add tags if selected
      if (formData.tag.length > 0) {
        const tagData = [];        for (const tagId of formData.tag) {
          const selectedTag = tags.find(tag => tag.id === tagId);
          if (selectedTag) {
            tagData.push({
              name: selectedTag.name,
              slug: selectedTag.slug
            });
          }
        }
        if (tagData.length > 0) {
          postData.tag = tagData;
        }
      }

      console.log('Sending post data:', JSON.stringify(postData, null, 2));

      // For now, let's not handle image upload to simplify
      // if (formData.image) {
      //   // Handle image upload separately if needed
      // }

      const response = await blogApi.createPost(postData);
      setSuccess('Post created successfully!');

      // Reset form
      setFormData({
        title: '',
        content: '',
        category: '',
        tag: [],
        status: 'draft',
        image: null
      });

      // Call parent callback
      if (onPostCreated) {
        onPostCreated(response);
      }

    } catch (err) {
      let errorMessage = 'Failed to create post. Please try again.';

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
    <div className="create-post">
      <div className="create-post-header">
        <h2>Create New Post</h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
          >
            ✕
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="title">Post Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter your post title"
            maxLength="200"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            placeholder="Write your post content here..."
            rows="12"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="image">Featured Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleChange}
            accept="image/*"
          />
          {formData.image && (
            <div className="image-preview">
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Preview"
                style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }}
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Tags</label>
          <div className="tags-section">
            <div className="existing-tags">
              {tags.map(tag => (
                <label key={tag.id} className="tag-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.tag.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                  />
                  <span className="tag-label">{tag.name}</span>
                </label>
              ))}
            </div>

            <div className="add-tag">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTag())}
              />
              <button
                type="button"
                onClick={handleAddNewTag}
                className="add-tag-btn"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData({
                title: '',
                content: '',
                category: '',
                tag: [],
                status: 'draft',
                image: null
              });
              setError('');
              setSuccess('');
            }}
            className="reset-btn"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
