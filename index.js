const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const config = require('./src/config');
const productsRoutes = require('./src/routes/productsRoutes');
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

// Обработка несуществующих маршрутов
app.use(notFoundHandler);

// Обработка ошибок
app.use(errorHandler);

// Запуск сервера
app.listen(config.port, () => {
  console.log(`🚀 Сервер запущен на порту ${config.port}`);
  console.log(`📋 API доступно по адресу: http://localhost:${config.port}${config.api.baseUrl}/products`);
  console.log(`📚 Документация OpenAPI: http://localhost:${config.port}/api/docs`);
});

module.exports = app;