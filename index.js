require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const config = require('./src/config');
const database = require('./src/config/database');
const productsRoutes = require('./src/routes/productsRoutes');
const categoriesRoutes = require('./src/routes/categoriesRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const authRoutes = require('./src/routes/authRoutes');
const ordersRoutes = require('./src/routes/ordersRoutes');
const { errorHandler, notFoundHandler, requestLogger } = require('./src/middleware');
const { uploadMiddleware } = require('./src/middleware/upload');
const emailService = require('./src/utils/emailService');

const app = express();

// Загрузка OpenAPI спецификации
const openApiSpec = YAML.parse(fs.readFileSync('./openapi.yaml', 'utf8'));

// Middleware
app.use(express.json());
app.use(requestLogger);

// Middleware для загрузки файлов (только для маршрутов upload)
app.use(`${config.api.baseUrl}/upload`, uploadMiddleware);

// Обработка ошибок multipart
app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Размер файла превышает 5MB'
    });
  }
  if (error.message === 'Unexpected end of form') {
    return res.status(400).json({
      success: false,
      message: 'Некорректный multipart запрос'
    });
  }
  next(error);
});

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Маршруты API
app.use(`${config.api.baseUrl}/auth`, authRoutes);
app.use(`${config.api.baseUrl}/products`, productsRoutes);
app.use(`${config.api.baseUrl}/categories`, categoriesRoutes);
app.use(`${config.api.baseUrl}/upload`, uploadRoutes);
app.use(`${config.api.baseUrl}/orders`, ordersRoutes);

// Статические файлы (после API маршрутов)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Обработка несуществующих маршрутов
app.use(notFoundHandler);

// Обработка ошибок
app.use(errorHandler);

// Инициализация базы данных и запуск сервера
async function startServer() {
  try {
    // Подключение к базе данных
    await database.connect();

    // Инициализация таблиц
    await database.initTables();

    // Проверка подключения к SMTP серверу
    console.log('📧 Проверка подключения к SMTP серверу...');
    const isEmailConnected = await emailService.verifyConnection();
    if (!isEmailConnected) {
      console.error('❌ Не удалось подключиться к SMTP серверу');
      console.error('   Проверьте настройки EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS в .env файле');
      process.exit(1);
    }
    console.log('✅ SMTP сервер готов к отправке писем');

    // Запуск сервера
    app.listen(config.port, () => {
      console.log(`🚀 Сервер запущен на порту ${config.port}`);
      console.log(`📋 API доступно по адресу: http://localhost:${config.port}${config.api.baseUrl}/products`);
      console.log(`📚 Документация OpenAPI: http://localhost:${config.port}/api/docs`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

// Обработка завершения процесса
process.on('SIGINT', async () => {
  console.log('\n🛑 Получен сигнал завершения...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Получен сигнал завершения...');
  await database.close();
  process.exit(0);
});

startServer();

module.exports = app;