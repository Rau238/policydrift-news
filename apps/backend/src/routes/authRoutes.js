const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  refreshToken,
  updatePassword
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
  updatePasswordValidator
} = require('../validators/authValidator');
const validate = require('../middleware/validator');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);
router.post('/forgot-password', resetPasswordValidator, validate, forgotPassword);
router.post('/reset-password/:token', updatePasswordValidator, validate, resetPassword);
router.post('/refresh-token', refreshToken);
router.put('/update-password', authMiddleware, updatePassword);

module.exports = router;
