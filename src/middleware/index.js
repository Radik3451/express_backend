// Middleware для обработки ошибок
const errorHandler = (err, req, res, next) => {
  console.error('Ошибка:', err.stack);
  
  // Ошибка валидации JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Неверный формат JSON'
    });
  }
  
  // Общая ошибка сервера
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера'
  });
};

// Middleware для обработки несуществующих маршрутов
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не найден'
  });
};

// Middleware для логирования запросов
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  next();
};

// Экспорт валидационных middleware
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateIdParam,
  validateFilterProducts
} = require('./validation');

module.exports = {
  errorHandler,
  notFoundHandler,
  requestLogger,
  validateCreateProduct,
  validateUpdateProduct,
  validateIdParam,
  validateFilterProducts
};
