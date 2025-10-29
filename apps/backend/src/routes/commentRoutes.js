const express = require('express');
const router = express.Router();
const {
  getArticleComments,
  createComment,
  updateComment,
  deleteComment,
  toggleLike,
  approveComment,
  getAllComments
} = require('../controllers/commentController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { createCommentValidator, updateCommentValidator } = require('../validators/commentValidator');
const validate = require('../middleware/validator');

router.get('/', authMiddleware, adminMiddleware, getAllComments);
router.get('/article/:articleId', optionalAuth, getArticleComments);
router.post('/', authMiddleware, createCommentValidator, validate, createComment);
router.put('/:id', authMiddleware, updateCommentValidator, validate, updateComment);
router.delete('/:id', authMiddleware, deleteComment);
router.post('/:id/like', authMiddleware, toggleLike);
router.put('/:id/approve', authMiddleware, adminMiddleware, approveComment);

module.exports = router;
