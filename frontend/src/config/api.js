// API configuration for the Django backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication endpoints
  LOGIN: '/api-auth/login/',
  LOGOUT: '/api-auth/logout/',

  // Post endpoints (matching Django URLs)
  POSTS: '/api/Post/blog_list/',
  POST_DETAIL: (slug) => `/api/Post/blog_detail/${slug}/`,
  CREATE_POST: '/api/Post/post_blog/',

  // Category endpoints
  CATEGORIES: '/api/Post/category_list/',
  CATEGORY_POSTS: (slug) => `/api/Post/post_category_slug/${slug}`,

  // Tag endpoints
  TAGS: '/api/Post/tag_list/',
  TAG_POSTS: (slug) => `/api/Post/post_tag_slug/${slug}`,

  // Comment endpoints
  SEND_COMMENT: (slug) => `/api/Post/post/${slug}/send_comment`,
  READ_COMMENTS: (slug) => `/api/Post/post/${slug}/read_comments`,

  // User endpoints
  USERS: '/api/user/',

  // Admin endpoints
  ADMIN_POSTS: '/api/Post/admin/posts/',
  ADMIN_POST: (slug) => `/api/Post/admin/post/${slug}`,
  ADMIN_COMMENTS: '/api/Post/admin/comments',
};

export default API_BASE_URL;
