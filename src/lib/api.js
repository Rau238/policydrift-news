import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
            { refreshToken }
          );

          localStorage.setItem('token', data.data.token);
          localStorage.setItem('refreshToken', data.data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle errors
const handleError = (error) => {
  if (error.response) {
    // Server responded with error
    throw new Error(error.response.data.message || 'An error occurred');
  } else if (error.request) {
    // Request made but no response
    throw new Error('No response from server. Please check your connection.');
  } else {
    // Something else happened
    throw new Error(error.message || 'An error occurred');
  }
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  login: async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  logout: async () => {
    try {
      const { data } = await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  forgotPassword: async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  resetPassword: async (token, password) => {
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    try {
      const { data } = await api.put('/auth/update-password', {
        currentPassword,
        newPassword
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};

// Articles API
export const articlesAPI = {
  getAll: async (params = {}) => {
    try {
      const { data } = await api.get('/articles', { params });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getBySlug: async (slug) => {
    try {
      const { data } = await api.get(`/articles/${slug}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (articleData) => {
    try {
      const formData = new FormData();
      Object.keys(articleData).forEach(key => {
        if (key === 'tags' && Array.isArray(articleData[key])) {
          articleData[key].forEach(tag => formData.append('tags[]', tag));
        } else if (key === 'featured_image' && articleData[key] instanceof File) {
          formData.append('featured_image', articleData[key]);
        } else {
          formData.append(key, articleData[key]);
        }
      });

      const { data } = await api.post('/articles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, articleData) => {
    try {
      const formData = new FormData();
      Object.keys(articleData).forEach(key => {
        if (key === 'tags' && Array.isArray(articleData[key])) {
          articleData[key].forEach(tag => formData.append('tags[]', tag));
        } else if (key === 'featured_image' && articleData[key] instanceof File) {
          formData.append('featured_image', articleData[key]);
        } else if (articleData[key] !== undefined && articleData[key] !== null) {
          formData.append(key, articleData[key]);
        }
      });

      const { data } = await api.put(`/articles/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const { data } = await api.delete(`/articles/${id}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getTrending: async (limit = 5) => {
    try {
      const { data } = await api.get('/articles/trending', { params: { limit } });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getFeatured: async (limit = 3) => {
    try {
      const { data } = await api.get('/articles/featured', { params: { limit } });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getRelated: async (id, limit = 4) => {
    try {
      const { data } = await api.get(`/articles/${id}/related`, { params: { limit } });
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async (params = {}) => {
    try {
      const { data } = await api.get('/categories', { params });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const { data } = await api.get(`/categories/${id}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getBySlug: async (slug) => {
    try {
      const { data } = await api.get(`/categories/slug/${slug}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (categoryData) => {
    try {
      const { data } = await api.post('/categories', categoryData);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, categoryData) => {
    try {
      const { data } = await api.put(`/categories/${id}`, categoryData);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const { data } = await api.delete(`/categories/${id}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};

// Tags API
export const tagsAPI = {
  getAll: async (params = {}) => {
    try {
      const { data } = await api.get('/tags', { params });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getPopular: async (limit = 10) => {
    try {
      const { data } = await api.get('/tags/popular', { params: { limit } });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const { data } = await api.get(`/tags/${id}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getBySlug: async (slug) => {
    try {
      const { data } = await api.get(`/tags/slug/${slug}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (tagData) => {
    try {
      const { data } = await api.post('/tags', tagData);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, tagData) => {
    try {
      const { data } = await api.put(`/tags/${id}`, tagData);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const { data } = await api.delete(`/tags/${id}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};

// Comments API
export const commentsAPI = {
  getByArticle: async (articleId, params = {}) => {
    try {
      const { data } = await api.get(`/comments/article/${articleId}`, { params });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getAll: async (params = {}) => {
    try {
      const { data } = await api.get('/comments', { params });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (commentData) => {
    try {
      const { data } = await api.post('/comments', commentData);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id, content) => {
    try {
      const { data } = await api.put(`/comments/${id}`, { content });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const { data } = await api.delete(`/comments/${id}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  toggleLike: async (id) => {
    try {
      const { data } = await api.post(`/comments/${id}/like`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  approve: async (id) => {
    try {
      const { data } = await api.put(`/comments/${id}/approve`);
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};

// Bookmarks API
export const bookmarksAPI = {
  getAll: async (params = {}) => {
    try {
      const { data } = await api.get('/bookmarks', { params });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  toggle: async (articleId) => {
    try {
      const { data } = await api.post(`/bookmarks/${articleId}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  check: async (articleId) => {
    try {
      const { data } = await api.get(`/bookmarks/check/${articleId}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const { data } = await api.delete(`/bookmarks/${id}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};

// Newsletter API
export const newsletterAPI = {
  subscribe: async (email) => {
    try {
      const { data } = await api.post('/newsletter/subscribe', { email });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  unsubscribe: async (email) => {
    try {
      const { data } = await api.post('/newsletter/unsubscribe', { email });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getSubscribers: async (params = {}) => {
    try {
      const { data } = await api.get('/newsletter/subscribers', { params });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  deleteSubscriber: async (id) => {
    try {
      const { data } = await api.delete(`/newsletter/${id}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};

// Users API
export const usersAPI = {
  getAll: async (params = {}) => {
    try {
      const { data } = await api.get('/users', { params });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getById: async (id) => {
    try {
      const { data } = await api.get(`/users/${id}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await api.put('/users/profile', profileData);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const { data } = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  updateRole: async (id, role) => {
    try {
      const { data } = await api.put(`/users/${id}/role`, { role });
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  deactivate: async (id) => {
    try {
      const { data} = await api.put(`/users/${id}/deactivate`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  activate: async (id) => {
    try {
      const { data } = await api.put(`/users/${id}/activate`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id) => {
    try {
      const { data } = await api.delete(`/users/${id}`);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  getStats: async () => {
    try {
      const { data } = await api.get('/users/stats');
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};

// Site Settings API
export const siteSettingsAPI = {
  get: async () => {
    try {
      const { data } = await api.get('/site-settings');
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (settings) => {
    try {
      const { data } = await api.put('/site-settings', settings);
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  updateSection: async (section, sectionData) => {
    try {
      const { data } = await api.put(`/site-settings/${section}`, sectionData);
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};

export default api;
