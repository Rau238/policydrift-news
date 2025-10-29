const { body } = require('express-validator');

const createCommentValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  body('article')
    .notEmpty()
    .withMessage('Article ID is required')
    .isMongoId()
    .withMessage('Invalid article ID'),
  body('parent_comment')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
];

const updateCommentValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
];

module.exports = {
  createCommentValidator,
  updateCommentValidator
};
