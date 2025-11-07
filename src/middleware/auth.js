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
      console.error('❌ JWT verification error:', err.message);
      console.error('   Token:', token.substring(0, 20) + '...');
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

module.exports = {
  authenticateToken
};
