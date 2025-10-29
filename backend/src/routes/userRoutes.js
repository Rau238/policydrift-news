const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateProfile,
  uploadUserAvatar,
  updateUserRole,
  deactivateUser,
  activateUser,
  deleteUser,
  getUserStats
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', authMiddleware, adminMiddleware, getUsers);
router.get('/stats', authMiddleware, adminMiddleware, getUserStats);
router.get('/:id', getUserById);
router.put('/profile', authMiddleware, updateProfile);
router.post('/avatar', authMiddleware, upload.single('avatar'), uploadUserAvatar);
router.put('/:id/role', authMiddleware, adminMiddleware, updateUserRole);
router.put('/:id/deactivate', authMiddleware, adminMiddleware, deactivateUser);
router.put('/:id/activate', authMiddleware, adminMiddleware, activateUser);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
