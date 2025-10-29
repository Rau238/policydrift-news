const Category = require('../models/Category');
const { paginate } = require('../utils/pagination');
const { asyncHandler, createError } = require('../utils/validation');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const { page, limit, active } = req.query;

  const query = {};
  if (active !== undefined) {
    query.isActive = active === 'true';
  }

  if (page && limit) {
    const result = await paginate(Category, query, {
      page,
      limit,
      sort: { order: 1, name: 1 },
      populate: 'parent_category'
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  }

  const categories = await Category.find(query)
    .populate('parent_category')
    .sort({ order: 1, name: 1 });

  res.json({
    success: true,
    data: { categories }
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parent_category');

  if (!category) {
    throw createError('Category not found', 404);
  }

  res.json({
    success: true,
    data: { category }
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate('parent_category');

  if (!category) {
    throw createError('Category not found', 404);
  }

  res.json({
    success: true,
    data: { category }
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category }
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    throw createError('Category not found', 404);
  }

  category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('parent_category');

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: { category }
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw createError('Category not found', 404);
  }

  await Category.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});
