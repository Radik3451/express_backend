const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateRegisterUser,
  validateLoginUser,
  validateRefreshToken
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

module.exports = router;
