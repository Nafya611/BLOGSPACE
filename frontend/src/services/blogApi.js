import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

// Blog API service functions
export const blogApi = {
  // Post-related API calls
  async getPosts(params = {}) {
    try {
      console.log('BlogAPI getPosts called with params:', params); // Debug log
      const response = await apiClient.get(API_ENDPOINTS.POSTS, { params });
      console.log('BlogAPI getPosts response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  async getPost(slug) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.POST_DETAIL(slug));
      return response.data;
    } catch (error) {
      console.error(`Error fetching post ${slug}:`, error);
      throw error;
    }
  },

  async createPost(postData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CREATE_POST, postData);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  async updatePost(slug, postData) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.POST_DETAIL(slug), postData);
      return response.data;
    } catch (error) {
      console.error(`Error updating post ${slug}:`, error);
      throw error;
    }
  },

  async deletePost(slug) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.POST_DETAIL(slug));
      return response.data;
    } catch (error) {
      console.error(`Error deleting post ${slug}:`, error);
      throw error;
    }
  },

  // Category-related API calls
  async getCategories() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getPostsByCategory(slug) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORY_POSTS(slug));
      return response.data;
    } catch (error) {
      console.error(`Error fetching posts for category ${slug}:`, error);
      throw error;
    }
  },

  // Tag-related API calls
  async getTags() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TAGS);
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  async getPostsByTag(slug) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TAG_POSTS(slug));
      return response.data;
    } catch (error) {
      console.error(`Error fetching posts for tag ${slug}:`, error);
      throw error;
    }
  },

  // Comment-related API calls
  async getComments(slug) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.READ_COMMENTS(slug));
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for post ${slug}:`, error);
      throw error;
    }
  },

  async createComment(slug, commentData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SEND_COMMENT(slug), commentData);
      return response.data;
    } catch (error) {
      console.error(`Error creating comment for post ${slug}:`, error);
      throw error;
    }
  },
};

export default blogApi;
