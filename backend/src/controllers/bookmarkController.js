const Bookmark = require('../models/Bookmark');
const Article = require('../models/Article');
const { paginate } = require('../utils/pagination');
const { asyncHandler, createError } = require('../utils/validation');

// @desc    Get user's bookmarks
// @route   GET /api/bookmarks
// @access  Private
exports.getUserBookmarks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await paginate(Bookmark, { user: req.user._id }, {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: {
      path: 'article',
      populate: [
        { path: 'author', select: 'full_name avatar_url' },
        { path: 'category', select: 'name slug color' }
      ]
    }
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// @desc    Toggle bookmark
// @route   POST /api/bookmarks/:articleId
// @access  Private
exports.toggleBookmark = asyncHandler(async (req, res) => {
  const { articleId } = req.params;

  // Verify article exists
  const article = await Article.findById(articleId);
  if (!article) {
    throw createError('Article not found', 404);
  }

  // Check if bookmark exists
  const existingBookmark = await Bookmark.findOne({
    user: req.user._id,
    article: articleId
  });

  if (existingBookmark) {
    // Remove bookmark
    await Bookmark.findByIdAndDelete(existingBookmark._id);
    
    return res.json({
      success: true,
      message: 'Bookmark removed',
      data: { bookmarked: false }
    });
  }

  // Create bookmark
  const bookmark = await Bookmark.create({
    user: req.user._id,
    article: articleId
  });

  res.json({
    success: true,
    message: 'Article bookmarked',
    data: { bookmark, bookmarked: true }
  });
});

// @desc    Check if article is bookmarked
// @route   GET /api/bookmarks/check/:articleId
// @access  Private
exports.checkBookmark = asyncHandler(async (req, res) => {
  const { articleId } = req.params;

  const bookmark = await Bookmark.findOne({
    user: req.user._id,
    article: articleId
  });

  res.json({
    success: true,
    data: { bookmarked: !!bookmark }
  });
});

// @desc    Delete bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private
exports.deleteBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const bookmark = await Bookmark.findById(id);

  if (!bookmark) {
    throw createError('Bookmark not found', 404);
  }

  // Check if user owns the bookmark
  if (bookmark.user.toString() !== req.user._id.toString()) {
    throw createError('Not authorized to delete this bookmark', 403);
  }

  await Bookmark.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Bookmark deleted successfully'
  });
});
