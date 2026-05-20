const express = require('express');
const router = express.Router();
const { registerValidation, loginValidation } = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getMe,
  completeOnboarding,
  refreshToken
} = require('../controllers/authController');

// Public Auth Routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/refresh', refreshToken);

// Protected Auth Routes
router.get('/me', protect, getMe);
router.put('/onboarding', protect, completeOnboarding);

module.exports = router;
