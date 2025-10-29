const express = require('express');
const router = express.Router();
const {
  getUserBookmarks,
  toggleBookmark,
  checkBookmark,
  deleteBookmark
} = require('../controllers/bookmarkController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getUserBookmarks);
router.post('/:articleId', authMiddleware, toggleBookmark);
router.get('/check/:articleId', authMiddleware, checkBookmark);
router.delete('/:id', authMiddleware, deleteBookmark);

module.exports = router;
