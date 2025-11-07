const userModel = require('../models/users');

/**
 * Middleware для проверки подтверждения email (опциональный)
 * Добавляет информацию о статусе подтверждения email в объект запроса
 * @param {import('express').Request} req - Express request объект
 * @param {import('express').Response} res - Express response объект
 * @param {import('express').NextFunction} next - Express next функция
 */
const checkEmailVerification = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const isVerified = await userModel.isEmailVerified(req.user.userId);

    // Добавляем информацию о верификации в объект запроса
    req.emailVerified = isVerified;

    // Перехватываем json() метод для добавления информации о верификации
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      // Если это успешный ответ с данными, добавляем информацию о верификации
      if (data && typeof data === 'object' && !data.emailVerificationStatus) {
        data.emailVerificationStatus = {
          verified: isVerified,
          warning: !isVerified ? 'Email не подтвержден. Некоторые функции могут быть ограничены.' : null
        };
      }
      return originalJson(data);
    };

    next();
  } catch (error) {
    console.error('Ошибка проверки подтверждения email:', error);
    next();
  }
};

/**
 * Middleware для обязательной проверки подтверждения email
 * Блокирует запрос, если email не подтвержден
 * @param {import('express').Request} req - Express request объект
 * @param {import('express').Response} res - Express response объект
 * @param {import('express').NextFunction} next - Express next функция
 */
const requireEmailVerification = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }

    const isVerified = await userModel.isEmailVerified(req.user.userId);

    if (!isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Требуется подтверждение email. Проверьте вашу почту или запросите новое письмо через /api/auth/resend-verification',
        error_code: 'EMAIL_NOT_VERIFIED'
      });
    }

    next();
  } catch (error) {
    console.error('Ошибка проверки подтверждения email:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка проверки подтверждения email'
    });
  }
};

module.exports = {
  checkEmailVerification,
  requireEmailVerification
};
