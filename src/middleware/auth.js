const jwt = require('jsonwebtoken');

/**
 * Middleware для проверки JWT токена
 * @param {import('express').Request} req - Express request объект
 * @param {import('express').Response} res - Express response объект
 * @param {import('express').NextFunction} next - Express next функция
 */
const authenticateToken = (req, res, next) => {
  // Получаем токен из заголовка Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Токен доступа не предоставлен'
    });
  }

  // Секретный ключ для JWT (должен совпадать с тем, что используется в контроллере)
  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

  // Проверяем токен
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Недействительный токен доступа'
      });
    }

    // Добавляем информацию о пользователе в объект запроса
    req.user = user;
    next();
  });
};

/**
 * Middleware для проверки JWT токена (опциональный)
 * Если токен не предоставлен, запрос проходит дальше
 * Если токен недействителен, возвращает ошибку
 * @param {import('express').Request} req - Express request объект
 * @param {import('express').Response} res - Express response объект
 * @param {import('express').NextFunction} next - Express next функция
 */
const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Если токен не предоставлен, продолжаем без авторизации
    req.user = null;
    return next();
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Недействительный токен доступа'
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Middleware для проверки роли пользователя
 * @param {string[]} allowedRoles - Массив разрешенных ролей
 * @returns {Function} Express middleware
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }

    // В данной реализации у нас нет ролей, но можно расширить
    // if (!allowedRoles.includes(req.user.role)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Недостаточно прав доступа'
    //   });
    // }

    next();
  };
};

/**
 * Middleware для проверки, что пользователь может изменять только свои данные
 * @param {string} userIdParam - Название параметра с ID пользователя в URL
 * @returns {Function} Express middleware
 */
const requireOwnership = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация'
      });
    }

    const requestedUserId = parseInt(req.params[userIdParam]);
    const currentUserId = req.user.userId;

    if (requestedUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен. Вы можете изменять только свои данные'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  requireRole,
  requireOwnership
};
