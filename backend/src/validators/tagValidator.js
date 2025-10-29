const { body } = require('express-validator');

const createTagValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tag name is required')
    .isLength({ max: 30 })
    .withMessage('Tag name cannot exceed 30 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code')
];

const updateTagValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Tag name cannot exceed 30 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code')
];

module.exports = {
  createTagValidator,
  updateTagValidator
};
