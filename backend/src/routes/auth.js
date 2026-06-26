const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/auth');
const { validateRegistration, validateLogin } = require('../middlewares/validator');
const { authLimiter } = require('../middlewares/rateLimiter');

// Public/rate-limited Auth routes
router.post('/signup', authLimiter, validateRegistration, authController.signup);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);

// Protected Auth routes
router.get('/profile', requireAuth, authController.getProfile);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;
