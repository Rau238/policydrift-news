const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getTrendingArticles,
  getFeaturedArticles,
  getRelatedArticles
} = require('../controllers/articleController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createArticleValidator, updateArticleValidator } = require('../validators/articleValidator');
const validate = require('../middleware/validator');

router.get('/', optionalAuth, getArticles);
router.get('/trending', getTrendingArticles);
router.get('/featured', getFeaturedArticles);
router.get('/:slug', optionalAuth, getArticleBySlug);
router.get('/:id/related', getRelatedArticles);
router.post('/', authMiddleware, upload.single('featured_image'), createArticleValidator, validate, createArticle);
router.put('/:id', authMiddleware, upload.single('featured_image'), updateArticleValidator, validate, updateArticle);
router.delete('/:id', authMiddleware, adminMiddleware, deleteArticle);

module.exports = router;
