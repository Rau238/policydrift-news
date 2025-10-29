const User = require('../models/User');
const { paginate } = require('../utils/pagination');
const { asyncHandler, createError } = require('../utils/validation');
const { uploadAvatar, deleteFromCloudinary } = require('../utils/imageUpload');

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, active } = req.query;

  const query = {};
  if (role) query.role = role;
  if (active !== undefined) query.isActive = active === 'true';

  const result = await paginate(User, query, {
    page,
    limit,
    sort: { createdAt: -1 }
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user }
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { full_name, username, bio } = req.body;

  const user = await User.findById(req.user._id);

  if (full_name) user.full_name = full_name;
  if (username) user.username = username;
  if (bio !== undefined) user.bio = bio;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private
exports.uploadUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createError('No file uploaded', 400);
  }

  const user = await User.findById(req.user._id);

  // Delete old avatar if exists
  if (user.avatar_url) {
    try {
      await deleteFromCloudinary(user.avatar_url);
    } catch (err) {
      console.error('Failed to delete old avatar:', err);
    }
  }

  // Upload new avatar
  const avatarUrl = await uploadAvatar(req.file.buffer, req.user._id);

  user.avatar_url = avatarUrl;
  await user.save();

  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: { avatar_url: avatarUrl }
  });
});

// @desc    Update user role (Admin)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    throw createError('Invalid role', 400);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true }
  );

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'User role updated successfully',
    data: { user }
  });
});

// @desc    Deactivate user (Admin)
// @route   PUT /api/users/:id/deactivate
// @access  Private (Admin)
exports.deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'User deactivated successfully',
    data: { user }
  });
});

// @desc    Activate user (Admin)
// @route   PUT /api/users/:id/activate
// @access  Private (Admin)
exports.activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true }
  );

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'User activated successfully',
    data: { user }
  });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw createError('User not found', 404);
  }

  // Delete avatar if exists
  if (user.avatar_url) {
    try {
      await deleteFromCloudinary(user.avatar_url);
    } catch (err) {
      console.error('Failed to delete avatar:', err);
    }
  }

  await User.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get user statistics (Admin)
// @route   GET /api/users/stats
// @access  Private (Admin)
exports.getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const admins = await User.countDocuments({ role: 'admin' });
  const newUsersThisMonth = await User.countDocuments({
    createdAt: {
      $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    }
  });

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      admins,
      newUsersThisMonth
    }
  });
});
