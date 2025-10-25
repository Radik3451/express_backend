const express = require('express');
const config = require('./src/config');
const productsRoutes = require('./src/routes/productsRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const { errorHandler, notFoundHandler, requestLogger } = require('./src/middleware');

const app = express();

// Middleware
app.use(express.json());
app.use(requestLogger);

// Корневой маршрут с информацией об API
app.get('/', (req, res) => {
  res.json({
    message: 'API сервера для управления товарами',
    version: config.api.version,
    endpoints: {
      'GET /api/products': 'Получить все товары',
      'GET /api/products?category=...': 'Получить товары по категории',
      'GET /api/products?q=...': 'Поиск товаров',
      'GET /api/products?category=...&q=...': 'Комбинированная фильтрация',
      'GET /api/products/:id': 'Получить товар по ID',
      'POST /api/products': 'Создать новый товар',
      'PATCH /api/products/:id': 'Обновить товар по ID',
      'DELETE /api/products/:id': 'Удалить товар по ID',
      'GET /api/stats': 'Получить статистику по товарам'
    }
  });
});

// Маршруты API
app.use(`${config.api.baseUrl}/products`, productsRoutes);
app.use(`${config.api.baseUrl}/stats`, statsRoutes);

// Обработка несуществующих маршрутов
app.use(notFoundHandler);

// Обработка ошибок
app.use(errorHandler);

// Запуск сервера
app.listen(config.port, () => {
  console.log(`Сервер запущен на порту ${config.port}`);
  console.log(`API доступно по адресу: http://localhost:${config.port}${config.api.baseUrl}/products`);
  console.log(`Корневая страница: http://localhost:${config.port}/`);
});

module.exports = app;