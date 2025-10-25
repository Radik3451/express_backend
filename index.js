const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const config = require('./src/config');
const database = require('./src/config/database');
const productsRoutes = require('./src/routes/productsRoutes');
const categoriesRoutes = require('./src/routes/categoriesRoutes');
const { errorHandler, notFoundHandler, requestLogger } = require('./src/middleware');

const app = express();

// Загрузка OpenAPI спецификации
const openApiSpec = YAML.parse(fs.readFileSync('./openapi.yaml', 'utf8'));

// Middleware
app.use(express.json());
app.use(requestLogger);

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Маршруты API
app.use(`${config.api.baseUrl}/products`, productsRoutes);
app.use(`${config.api.baseUrl}/categories`, categoriesRoutes);

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