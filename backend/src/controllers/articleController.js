const Article = require('../models/Article');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const { paginate } = require('../utils/pagination');
const { asyncHandler, createError } = require('../utils/validation');
const { uploadArticleImage, deleteFromCloudinary } = require('../utils/imageUpload');

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
exports.getArticles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status = 'published', category, tag, search, featured, breaking } = req.query;

  const query = {};

  // Filter by status (default to published for public access)
  if (!req.user || req.user.role !== 'admin') {
    query.status = 'published';
  } else if (status) {
    query.status = status;
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by tag
  if (tag) {
    query.tags = tag;
  }

  // Filter by featured
  if (featured) {
    query.isFeatured = featured === 'true';
  }

  // Filter by breaking news
  if (breaking) {
    query.isBreakingNews = breaking === 'true';
  }

  // Search
  if (search) {
    query.$text = { $search: search };
  }

  const result = await paginate(Article, query, {
    page,
    limit,
    sort: { published_at: -1, createdAt: -1 },
    populate: [
      { path: 'author', select: 'full_name email avatar_url' },
      { path: 'category', select: 'name slug color' },
      { path: 'tags', select: 'name slug color' }
    ]
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// @desc    Get single article by slug
// @route   GET /api/articles/:slug
// @access  Public
exports.getArticleBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const article = await Article.findOne({ slug })
    .populate('author', 'full_name email avatar_url bio')
    .populate('category', 'name slug color')
    .populate('tags', 'name slug color');

  if (!article) {
    throw createError('Article not found', 404);
  }

  // Check if user has access to view
  if (article.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
    throw createError('Article not found', 404);
  }

  // Increment views
  article.views += 1;
  await article.save();

  res.json({
    success: true,
    data: { article }
  });
});

// @desc    Create article
// @route   POST /api/articles
// @access  Private (Admin/Author)
exports.createArticle = asyncHandler(async (req, res) => {
  const { title, content, excerpt, category, tags, status, isFeatured, isBreakingNews, meta_title, meta_description, meta_keywords, allow_comments } = req.body;

  // Verify category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw createError('Category not found', 404);
  }

  // Verify tags exist
  if (tags && tags.length > 0) {
    const tagsExist = await Tag.find({ _id: { $in: tags } });
    if (tagsExist.length !== tags.length) {
      throw createError('One or more tags not found', 404);
    }
  }

  let featured_image = null;

  // Handle file upload if present
  if (req.file) {
    featured_image = await uploadArticleImage(req.file.buffer);
  } else if (req.body.featured_image) {
    featured_image = req.body.featured_image;
  }

  if (!featured_image) {
    throw createError('Featured image is required', 400);
  }

  const article = await Article.create({
    title,
    content,
    excerpt,
    featured_image,
    author: req.user._id,
    category,
    tags: tags || [],
    status: status || 'draft',
    isFeatured: isFeatured || false,
    isBreakingNews: isBreakingNews || false,
    meta_title,
    meta_description,
    meta_keywords,
    allow_comments: allow_comments !== false
  });

  const populatedArticle = await Article.findById(article._id)
    .populate('author', 'full_name email avatar_url')
    .populate('category', 'name slug color')
    .populate('tags', 'name slug color');

  res.status(201).json({
    success: true,
    message: 'Article created successfully',
    data: { article: populatedArticle }
  });
});

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (Admin/Author)
exports.updateArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let article = await Article.findById(id);

  if (!article) {
    throw createError('Article not found', 404);
  }

  // Check if user is author or admin
  if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw createError('Not authorized to update this article', 403);
  }

  // Handle image upload
  if (req.file) {
    // Delete old image if exists
    if (article.featured_image) {
      try {
        await deleteFromCloudinary(article.featured_image);
      } catch (err) {
        console.error('Failed to delete old image:', err);
      }
    }
    req.body.featured_image = await uploadArticleImage(req.file.buffer, id);
  }

  // Verify category if provided
  if (req.body.category) {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      throw createError('Category not found', 404);
    }
  }

  // Verify tags if provided
  if (req.body.tags && req.body.tags.length > 0) {
    const tagsExist = await Tag.find({ _id: { $in: req.body.tags } });
    if (tagsExist.length !== req.body.tags.length) {
      throw createError('One or more tags not found', 404);
    }
  }

  article = await Article.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('author', 'full_name email avatar_url')
    .populate('category', 'name slug color')
    .populate('tags', 'name slug color');

  res.json({
    success: true,
    message: 'Article updated successfully',
    data: { article }
  });
});

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (Admin)
exports.deleteArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const article = await Article.findById(id);

  if (!article) {
    throw createError('Article not found', 404);
  }

  // Delete featured image
  if (article.featured_image) {
    try {
      await deleteFromCloudinary(article.featured_image);
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  }

  await Article.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Article deleted successfully'
  });
});

// @desc    Get trending articles
// @route   GET /api/articles/trending
// @access  Public
exports.getTrendingArticles = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const articles = await Article.find({ status: 'published' })
    .sort({ views: -1, published_at: -1 })
    .limit(parseInt(limit))
    .populate('author', 'full_name avatar_url')
    .populate('category', 'name slug color')
    .select('title slug featured_image views published_at reading_time');

  res.json({
    success: true,
    data: { articles }
  });
});

// @desc    Get featured articles
// @route   GET /api/articles/featured
// @access  Public
exports.getFeaturedArticles = asyncHandler(async (req, res) => {
  const { limit = 3 } = req.query;

  const articles = await Article.find({ status: 'published', isFeatured: true })
    .sort({ published_at: -1 })
    .limit(parseInt(limit))
    .populate('author', 'full_name avatar_url')
    .populate('category', 'name slug color')
    .populate('tags', 'name slug');

  res.json({
    success: true,
    data: { articles }
  });
});

// @desc    Get related articles
// @route   GET /api/articles/:id/related
// @access  Public
exports.getRelatedArticles = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 4 } = req.query;

  const article = await Article.findById(id);
  
  if (!article) {
    throw createError('Article not found', 404);
  }

  const relatedArticles = await Article.find({
    _id: { $ne: id },
    status: 'published',
    $or: [
      { category: article.category },
      { tags: { $in: article.tags } }
    ]
  })
    .sort({ published_at: -1 })
    .limit(parseInt(limit))
    .populate('author', 'full_name avatar_url')
    .populate('category', 'name slug color')
    .select('title slug featured_image published_at reading_time');

  res.json({
    success: true,
    data: { articles: relatedArticles }
  });
});

module.exports = exports;
