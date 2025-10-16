/**
 * Utility Functions for News Website
 */

/**
 * Auto-categorize old news
 * Changes "Breaking" category to "Recent" if article is older than 1 day
 * 
 * @param {Object} article - The article object
 * @param {string} article.created_at - ISO date string of when article was created
 * @param {Object} article.categories - Category object with name
 * @returns {string} - Updated category name
 */
export const getArticleCategory = (article) => {
  if (!article || !article.categories) return 'News';
  
  const categoryName = article.categories.name;
  
  // Only auto-update "Breaking" category
  if (categoryName !== 'Breaking') {
    return categoryName;
  }
  
  // Calculate age of article
  const createdDate = new Date(article.created_at);
  const now = new Date();
  const diffMs = now - createdDate;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  // If older than 1 day, change to "Recent"
  if (diffDays > 1) {
    return 'Recent';
  }
  
  return 'Breaking';
};

/**
 * Format date for article display
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export const formatArticleDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Calculate reading time for an article
 * 
 * @param {string} content - Article content
 * @returns {number} - Estimated reading time in minutes
 */
export const calculateReadTime = (content) => {
  const wordsPerMinute = 200;
  const words = content?.split(/\s+/).length || 0;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes || 1;
};

/**
 * Truncate text to a specific length
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 160) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Get article age category
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} - Age category (new, recent, archive)
 */
export const getArticleAgeCategory = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = (now - date) / (1000 * 60 * 60 * 24);
  
  if (diffDays < 1) return 'new';
  if (diffDays < 7) return 'recent';
  if (diffDays < 30) return 'archive';
  return 'old';
};

/**
 * Get category badge color based on category name
 * 
 * @param {string} categoryName - Category name
 * @returns {string} - Tailwind color class
 */
export const getCategoryColor = (categoryName) => {
  const colors = {
    'Breaking': 'bg-red-600 text-white',
    'Recent': 'bg-blue-600 text-white',
    'Politics': 'bg-indigo-600 text-white',
    'Technology': 'bg-purple-600 text-white',
    'Business': 'bg-green-600 text-white',
    'Sports': 'bg-orange-600 text-white',
    'Entertainment': 'bg-pink-600 text-white',
    'Health': 'bg-teal-600 text-white',
    'Science': 'bg-cyan-600 text-white',
    'World': 'bg-gray-600 text-white',
    'default': 'bg-slate-600 text-white'
  };
  
  return colors[categoryName] || colors.default;
};

/**
 * Check if article is new (less than 24 hours old)
 * 
 * @param {string} dateString - ISO date string
 * @returns {boolean} - True if article is new
 */
export const isNewArticle = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = (now - date) / (1000 * 60 * 60);
  return diffHours < 24;
};

/**
 * Sort articles by date (newest first)
 * 
 * @param {Array} articles - Array of articles
 * @returns {Array} - Sorted articles
 */
export const sortArticlesByDate = (articles) => {
  return [...articles].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });
};
