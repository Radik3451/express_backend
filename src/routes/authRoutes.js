const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateRegisterUser,
  validateLoginUser,
  validateRefreshToken,
  validateUpdateProfile,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware');

// Маршруты для авторизации

// POST /api/auth/register - регистрация нового пользователя
router.post('/register', validateRegisterUser, authController.register);

// POST /api/auth/login - авторизация пользователя
router.post('/login', validateLoginUser, authController.login);

// POST /api/auth/refresh - обновление access токена
router.post('/refresh', validateRefreshToken, authController.refresh);

// POST /api/auth/logout - выход из системы
router.post('/logout', authenticateToken, authController.logout);

// GET /api/auth/profile - получить информацию о текущем пользователе
router.get('/profile', authenticateToken, authController.getProfile);

// PATCH /api/auth/profile - обновить профиль пользователя
router.patch('/profile', authenticateToken, validateUpdateProfile, authController.updateProfile);

// GET /api/auth/verify-email - подтверждение email по токену
router.get('/verify-email', authController.verifyEmail);

// POST /api/auth/resend-verification - повторная отправка письма с подтверждением
router.post('/resend-verification', authenticateToken, authController.resendVerificationEmail);

// POST /api/auth/forgot-password - запрос на сброс пароля
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

// POST /api/auth/reset-password - сброс пароля по токену
router.post('/reset-password', validateResetPassword, authController.resetPassword);

module.exports = router;
