import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

// Blog API service functions
export const blogApi = {
  // Post-related API calls
  async getPosts(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.POSTS, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  async getPost(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.POST_DETAIL(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching post ${id}:`, error);
      throw error;
    }
  },

  async createPost(postData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.POSTS, postData);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  async updatePost(id, postData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.POST_DETAIL(id), postData);
      return response.data;
    } catch (error) {
      console.error(`Error updating post ${id}:`, error);
      throw error;
    }
  },

  async deletePost(id) {
    try {
      await apiClient.delete(API_ENDPOINTS.POST_DETAIL(id));
      return true;
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error);
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

  // Comment-related API calls
  async getComments(postId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COMMENTS(postId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  },

  async createComment(postId, commentData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.COMMENTS(postId), commentData);
      return response.data;
    } catch (error) {
      console.error(`Error creating comment for post ${postId}:`, error);
      throw error;
    }
  },
};

export default blogApi;
