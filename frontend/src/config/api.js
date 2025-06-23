// API configuration for the Django backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication endpoints
  LOGIN: '/api-auth/login/',
  LOGOUT: '/api-auth/logout/',
  
  // Post endpoints
  POSTS: '/posts/',
  POST_DETAIL: (id) => `/posts/${id}/`,
  
  // Category endpoints
  CATEGORIES: '/categories/',
  
  // Comment endpoints
  COMMENTS: (postId) => `/posts/${postId}/comments/`,
  
  // User endpoints
  USERS: '/users/',
  USER_DETAIL: (id) => `/users/${id}/`,
};

export default API_BASE_URL;
