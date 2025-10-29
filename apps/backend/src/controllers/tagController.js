const Tag = require('../models/Tag');
const { paginate } = require('../utils/pagination');
const { asyncHandler, createError } = require('../utils/validation');

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
exports.getTags = asyncHandler(async (req, res) => {
  const { page, limit, active } = req.query;

  const query = {};
  if (active !== undefined) {
    query.isActive = active === 'true';
  }

  if (page && limit) {
    const result = await paginate(Tag, query, {
      page,
      limit,
      sort: { name: 1 }
    });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  }

  const tags = await Tag.find(query).sort({ name: 1 });

  res.json({
    success: true,
    data: { tags }
  });
});

// @desc    Get popular tags
// @route   GET /api/tags/popular
// @access  Public
exports.getPopularTags = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const Article = require('../models/Article');
  
  const tags = await Article.aggregate([
    { $match: { status: 'published' } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: parseInt(limit) },
    { $lookup: {
        from: 'tags',
        localField: '_id',
        foreignField: '_id',
        as: 'tag'
      }
    },
    { $unwind: '$tag' },
    { $project: {
        _id: '$tag._id',
        name: '$tag.name',
        slug: '$tag.slug',
        color: '$tag.color',
        count: 1
      }
    }
  ]);

  res.json({
    success: true,
    data: { tags }
  });
});

// @desc    Get single tag
// @route   GET /api/tags/:id
// @access  Public
exports.getTagById = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(req.params.id);

  if (!tag) {
    throw createError('Tag not found', 404);
  }

  res.json({
    success: true,
    data: { tag }
  });
});

// @desc    Get tag by slug
// @route   GET /api/tags/slug/:slug
// @access  Public
exports.getTagBySlug = asyncHandler(async (req, res) => {
  const tag = await Tag.findOne({ slug: req.params.slug });

  if (!tag) {
    throw createError('Tag not found', 404);
  }

  res.json({
    success: true,
    data: { tag }
  });
});

// @desc    Create tag
// @route   POST /api/tags
// @access  Private (Admin)
exports.createTag = asyncHandler(async (req, res) => {
  const tag = await Tag.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Tag created successfully',
    data: { tag }
  });
});

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private (Admin)
exports.updateTag = asyncHandler(async (req, res) => {
  let tag = await Tag.findById(req.params.id);

  if (!tag) {
    throw createError('Tag not found', 404);
  }

  tag = await Tag.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Tag updated successfully',
    data: { tag }
  });
});

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private (Admin)
exports.deleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(req.params.id);

  if (!tag) {
    throw createError('Tag not found', 404);
  }

  await Tag.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Tag deleted successfully'
  });
});
