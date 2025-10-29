const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { createCategoryValidator, updateCategoryValidator } = require('../validators/categoryValidator');
const validate = require('../middleware/validator');

router.get('/', getCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);
router.post('/', authMiddleware, adminMiddleware, createCategoryValidator, validate, createCategory);
router.put('/:id', authMiddleware, adminMiddleware, updateCategoryValidator, validate, updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;
