const Comment = require('../models/Comment');
const Article = require('../models/Article');
const { paginate } = require('../utils/pagination');
const { asyncHandler, createError } = require('../utils/validation');

// @desc    Get comments for an article
// @route   GET /api/comments/article/:articleId
// @access  Public
exports.getArticleComments = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const query = {
    article: articleId,
    parent_comment: null,
    isDeleted: false
  };

  // Show unapproved comments only to admins
  if (!req.user || req.user.role !== 'admin') {
    query.isApproved = true;
  }

  const result = await paginate(Comment, query, {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: [
      { path: 'user', select: 'full_name avatar_url' },
      {
        path: 'replies',
        match: { isDeleted: false, ...((!req.user || req.user.role !== 'admin') ? { isApproved: true } : {}) },
        populate: { path: 'user', select: 'full_name avatar_url' },
        options: { sort: { createdAt: 1 } }
      }
    ]
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
exports.createComment = asyncHandler(async (req, res) => {
  const { content, article, parent_comment } = req.body;

  // Verify article exists
  const articleExists = await Article.findById(article);
  if (!articleExists) {
    throw createError('Article not found', 404);
  }

  // Check if comments are allowed
  if (!articleExists.allow_comments) {
    throw createError('Comments are disabled for this article', 400);
  }

  // If replying to a comment, verify it exists
  if (parent_comment) {
    const parentExists = await Comment.findById(parent_comment);
    if (!parentExists) {
      throw createError('Parent comment not found', 404);
    }
  }

  const comment = await Comment.create({
    content,
    article,
    user: req.user._id,
    parent_comment: parent_comment || null
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate('user', 'full_name avatar_url');

  res.status(201).json({
    success: true,
    message: 'Comment created successfully',
    data: { comment: populatedComment }
  });
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  let comment = await Comment.findById(id);

  if (!comment) {
    throw createError('Comment not found', 404);
  }

  // Check if user owns the comment
  if (comment.user.toString() !== req.user._id.toString()) {
    throw createError('Not authorized to update this comment', 403);
  }

  comment.content = content;
  comment.isEdited = true;
  comment.editedAt = new Date();
  await comment.save();

  const populatedComment = await Comment.findById(comment._id)
    .populate('user', 'full_name avatar_url');

  res.json({
    success: true,
    message: 'Comment updated successfully',
    data: { comment: populatedComment }
  });
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (!comment) {
    throw createError('Comment not found', 404);
  }

  // Check if user owns the comment or is admin
  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw createError('Not authorized to delete this comment', 403);
  }

  // Soft delete
  comment.isDeleted = true;
  await comment.save();

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
});

// @desc    Like/Unlike comment
// @route   POST /api/comments/:id/like
// @access  Private
exports.toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (!comment) {
    throw createError('Comment not found', 404);
  }

  const userIndex = comment.likes.indexOf(req.user._id);

  if (userIndex > -1) {
    // Unlike
    comment.likes.splice(userIndex, 1);
  } else {
    // Like
    comment.likes.push(req.user._id);
  }

  await comment.save();

  res.json({
    success: true,
    message: userIndex > -1 ? 'Comment unliked' : 'Comment liked',
    data: { likes: comment.likes.length }
  });
});

// @desc    Approve comment (Admin only)
// @route   PUT /api/comments/:id/approve
// @access  Private (Admin)
exports.approveComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findByIdAndUpdate(
    id,
    { isApproved: true },
    { new: true }
  ).populate('user', 'full_name avatar_url');

  if (!comment) {
    throw createError('Comment not found', 404);
  }

  res.json({
    success: true,
    message: 'Comment approved successfully',
    data: { comment }
  });
});

// @desc    Get all comments (Admin only)
// @route   GET /api/comments
// @access  Private (Admin)
exports.getAllComments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, approved, deleted } = req.query;

  const query = {};
  
  if (approved !== undefined) {
    query.isApproved = approved === 'true';
  }
  
  if (deleted !== undefined) {
    query.isDeleted = deleted === 'true';
  }

  const result = await paginate(Comment, query, {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: [
      { path: 'user', select: 'full_name email avatar_url' },
      { path: 'article', select: 'title slug' }
    ]
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

module.exports = exports;
