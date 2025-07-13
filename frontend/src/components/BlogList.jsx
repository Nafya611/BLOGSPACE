import React, { useState, useEffect } from 'react';
import { blogApi } from '../services/blogApi';
import EditPost from './EditPost';
import BlogDetail from './BlogDetail';


const BlogList = ({ refreshTrigger }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  });
  // Search and filter state
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  // Fetch categories and tags for filter dropdowns
  useEffect(() => {
    console.log('Loading categories and tags...'); // Debug log
    blogApi.getCategories()
      .then(data => {
        console.log('Categories loaded:', data); // Debug log
        setCategories(data);
      })
      .catch(error => {
        console.error('Error loading categories:', error); // Debug log
        setCategories([]);
      });
    
    blogApi.getTags()
      .then(data => {
        console.log('Tags loaded:', data); // Debug log
        setTags(data);
      })
      .catch(error => {
        console.error('Error loading tags:', error); // Debug log
        setTags([]);
      });
  }, []);

  const fetchPosts = async (page = 1, searchParams = {}) => {
    try {
      setLoading(true);

      // Build query parameters
      const params = { page, ...searchParams };
      console.log('Fetching posts with params:', params); // Debug log

      const data = await blogApi.getPosts(params);
      console.log('Posts API response:', data); // Debug log

      // Handle paginated response
      if (data && data.results && Array.isArray(data.results)) {
        setPosts(data.results);
        setPagination({
          count: data.count || 0,
          next: data.next,
          previous: data.previous,
          currentPage: page
        });
        console.log('Pagination data:', {
          count: data.count,
          next: data.next,
          previous: data.previous,
          currentPage: page
        });
      } else if (Array.isArray(data)) {
        // Handle non-paginated response (fallback)
        setPosts(data);
        setPagination({
          count: data.length,
          next: null,
          previous: null,
          currentPage: 1
        });
      } else {
        // Fallback: set empty array if data structure is unexpected
        console.warn('Unexpected API response format:', data);
        setPosts([]);
        setPagination({
          count: 0,
          next: null,
          previous: null,
          currentPage: 1
        });
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch posts: ' + err.message);
      console.error('Error fetching posts:', err);
      // Set empty array on error to prevent map error
      setPosts([]);
      setPagination({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load without filters
    fetchPosts(1, {});
  }, [refreshTrigger]);

  // Get current filter parameters
  const getCurrentFilters = () => {
    const filters = {};
    if (search.trim()) filters.search = search.trim();
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedTag) filters.tag = selectedTag;
    console.log('Current filters:', filters); // Debug log
    return filters;
  };

  // Handle search and filter changes
  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    // Debounce search to avoid too many API calls
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      const filters = getCurrentFilters();
      filters.search = newSearch.trim();
      console.log('Search filters:', filters); // Debug log
      fetchPosts(1, filters);
    }, 500);
  };

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    const filters = getCurrentFilters();
    filters.category = newCategory;
    console.log('Category filters:', filters); // Debug log
    fetchPosts(1, filters);
  };

  const handleTagChange = (newTag) => {
    setSelectedTag(newTag);
    const filters = getCurrentFilters();
    filters.tag = newTag;
    console.log('Tag filters:', filters); // Debug log
    fetchPosts(1, filters);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedTag('');
    fetchPosts(1, {});
  };

  const handlePageChange = (page) => {
    const filters = getCurrentFilters();
    fetchPosts(page, filters);
  };

  const handleNextPage = () => {
    if (pagination.next) {
      handlePageChange(pagination.currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      handlePageChange(pagination.currentPage - 1);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
  };

  const handleViewPost = (post) => {
    setViewingPost(post);
  };

  const handleBackToList = () => {
    setViewingPost(null);
  };

  const handlePostUpdated = (updatedPost) => {
    // Update the post in the posts array
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.slug === updatedPost.slug ? updatedPost : post
      )
    );
    setEditingPost(null);

    // Optionally refetch to ensure data consistency
    // fetchPosts(pagination.currentPage);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  const handleDeletePost = async (post) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      try {
        await blogApi.deletePost(post.slug);

        // Check if we need to go to previous page (if current page becomes empty)
        const remainingPostsOnPage = posts.length - 1;
        const shouldGoToPreviousPage = remainingPostsOnPage === 0 && pagination.currentPage > 1;

        if (shouldGoToPreviousPage) {
          // Go to previous page
          fetchPosts(pagination.currentPage - 1);
        } else {
          // Refetch current page to maintain proper pagination
          fetchPosts(pagination.currentPage);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        setError(`Failed to delete post: ${error.message}`);
      }
    }
  };

  // Client-side filtering as backup (in case server-side filtering fails)
  const filteredPosts = posts.filter(post => {
    // Search filter (title, content, author)
    const searchLower = search.toLowerCase();
    const matchesSearch = !search ||
      post.title?.toLowerCase().includes(searchLower) ||
      post.content?.toLowerCase().includes(searchLower) ||
      (typeof post.author === 'string' && post.author.toLowerCase().includes(searchLower)) ||
      (typeof post.author === 'object' && post.author?.username?.toLowerCase().includes(searchLower));

    // Category filter
    const matchesCategory = !selectedCategory ||
      (post.category && (
        post.category.slug === selectedCategory || 
        post.category.name === selectedCategory ||
        (typeof post.category === 'string' && post.category === selectedCategory)
      ));

    // Tag filter
    const matchesTag = !selectedTag ||
      (post.tag && Array.isArray(post.tag) && post.tag.some(t => 
        t.slug === selectedTag || 
        t.name === selectedTag ||
        (typeof t === 'string' && t === selectedTag)
      ));

    return matchesSearch && matchesCategory && matchesTag;
  });

  console.log('Client-side filtered posts:', filteredPosts.length, 'of', posts.length); // Debug log

  if (loading) {
    return (
      <div className="blog-list">
        <h2>Blog Posts</h2>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-list">
        <h2>Blog Posts</h2>
        <div className="error">
          <p>{error}</p>
          <p>Make sure your Django server is running on http://localhost:8000</p>
        </div>
      </div>
    );
  }

  // Show BlogDetail when viewing a specific post
  if (viewingPost) {
    return (
      <BlogDetail
        post={viewingPost}
        onBack={handleBackToList}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
      />
    );
  }
  return (
    <div className="blog-list">
      <h2>Blog Posts</h2>
      {/* Search and filter UI */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          style={{ flex: '1 1 200px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <select
          value={selectedCategory}
          onChange={e => handleCategoryChange(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.slug || cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
        <select
          value={selectedTag}
          onChange={e => handleTagChange(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">All Tags</option>
          {tags.map(tag => (
            <option key={tag.slug || tag.id} value={tag.slug}>{tag.name}</option>
          ))}
        </select>
        {(search || selectedCategory || selectedTag) && (
          <button
            onClick={handleClearFilters}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #ccc', background: '#eee' }}
          >
            Clear
          </button>
        )}
      </div>

      {!Array.isArray(posts) || posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map((post, index) => (
            <div key={post.id || post.slug || index}>
              {editingPost && editingPost.slug === post.slug ? (
                <EditPost
                  post={post}
                  onPostUpdated={handlePostUpdated}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <article
                  className="post-card"
                  onClick={() => handleViewPost(post)}
                  style={{ cursor: 'pointer' }}
                  title="Click to view full post"
                >
                  {post.image && (
                    <div className="post-image">
                      <img
                        src={post.image}
                        alt={post.title || 'Post image'}
                        className="post-thumbnail"
                        onError={(e) => {
                          console.error('Failed to load image:', post.image);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', post.image);
                        }}
                      />
                    </div>
                  )}
                  <div className="post-header">
                    <h3>{post.title || 'Untitled'}</h3>
                    <div className="post-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click when clicking edit
                          handleEditPost(post);
                        }}
                        className="edit-btn"
                        title="Edit post"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click when clicking delete
                          handleDeletePost(post);
                        }}
                        className="delete-btn"
                        title="Delete post"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="post-meta">
                    {post.created_at && new Date(post.created_at).toLocaleDateString()}
                    {post.author && (typeof post.author === 'string' ? ` by ${post.author}` :
                      typeof post.author === 'object' && post.author.username ? ` by ${post.author.username}` : '')}
                  </p>
                  {post.content && (
                    <div className="post-excerpt">
                      {String(post.content).substring(0, 150)}...
                    </div>
                  )}
                  {post.category && (
                    <span className="post-category">
                      {typeof post.category === 'string' ? post.category :
                        typeof post.category === 'object' && post.category.name ? post.category.name : 'Category'}
                    </span>
                  )}
                </article>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.count > 3 && (pagination.next || pagination.previous) && (
        <div className="pagination">
          <div className="pagination-info">
            <span>
              Showing {posts.length} of {pagination.count} posts
            </span>
          </div>
          <div className="pagination-controls">
            <button
              onClick={handlePreviousPage}
              disabled={!pagination.previous}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="page-info">
              Page {pagination.currentPage}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!pagination.next}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogList;
