const express = require('express');
const router = express.Router();
const {
  getTags,
  getPopularTags,
  getTagById,
  getTagBySlug,
  createTag,
  updateTag,
  deleteTag
} = require('../controllers/tagController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { createTagValidator, updateTagValidator } = require('../validators/tagValidator');
const validate = require('../middleware/validator');

router.get('/', getTags);
router.get('/popular', getPopularTags);
router.get('/slug/:slug', getTagBySlug);
router.get('/:id', getTagById);
router.post('/', authMiddleware, adminMiddleware, createTagValidator, validate, createTag);
router.put('/:id', authMiddleware, adminMiddleware, updateTagValidator, validate, updateTag);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTag);

module.exports = router;
