// Конфигурация приложения
const config = {
  // Порт сервера
  port: process.env.PORT || 3000,
  
  // Настройки API
  api: {
    version: '1.0.0',
    baseUrl: '/api'
  },
  
  // Настройки CORS (если понадобится)
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // Настройки валидации
  validation: {
    maxNameLength: 100,
    maxDescriptionLength: 500,
    maxCategoryLength: 50,
    minPrice: 0,
    maxPrice: 999999
  }
};

module.exports = config;
