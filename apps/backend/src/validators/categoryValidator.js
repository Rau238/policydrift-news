const { body } = require('express-validator');

const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 50 })
    .withMessage('Category name cannot exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code'),
  body('parent_category')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID')
];

const updateCategoryValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category name cannot exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code'),
  body('parent_category')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID')
];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator
};
