// Middleware для обработки ошибок
const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  // Логируем ошибку с деталями
  console.error(`${timestamp} - ERROR: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  console.error(`Request: ${req.method} ${req.url}`);
  
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
  const startTime = Date.now();
  
  // Перехватываем ответ для логирования статуса
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Определяем тип сообщения на основе статуса
    let logLevel = 'INFO';
    let message = '';
    
    if (statusCode >= 400) {
      logLevel = 'ERROR';
      try {
        const responseData = JSON.parse(data);
        message = responseData.message || 'Ошибка';
      } catch (e) {
        message = 'Ошибка';
      }
    } else {
      logLevel = 'SUCCESS';
      message = 'OK';
    }
    
    // Логируем только один раз - с результатом
    console.log(`${timestamp} - ${req.method} ${req.url} - ${statusCode} ${logLevel} - ${message} (${duration}ms)`);
    
    // Вызываем оригинальный send
    return originalSend.call(this, data);
  };
  
  next();
};

// Экспорт валидационных middleware
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateCreateCategory,
  validateUpdateCategory,
  validateIdParam,
  validateFilterProducts,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateProfile,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
  validateCreateOrder,
  validateUpdateOrder
} = require('./validation');

module.exports = {
  errorHandler,
  notFoundHandler,
  requestLogger,
  validateCreateProduct,
  validateUpdateProduct,
  validateCreateCategory,
  validateUpdateCategory,
  validateIdParam,
  validateFilterProducts,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateProfile,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
  validateCreateOrder,
  validateUpdateOrder
};
