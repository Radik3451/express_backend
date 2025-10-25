# API Сервера для управления товарами

Простой REST API сервер для управления каталогом товаров, построенный на Express.js с модульной архитектурой.

## Структура проекта

```
server/
├── src/
│   ├── config/
│   │   └── index.js          # Конфигурация приложения
│   ├── controllers/
│   │   └── productsController.js  # Контроллеры для товаров
│   ├── middleware/
│   │   └── index.js          # Middleware функции
│   ├── models/
│   │   └── products.js       # Модель для работы с товарами
│   └── routes/
│       └──  productsRoutes.js # Маршруты для товаров
├── index.js                  # Основной файл сервера
├── package.json
├── yarn.lock
└── README.md
```

## Возможности

- ✅ Просмотр списка всех товаров
- ✅ Получение товара по ID
- ✅ Добавление нового товара
- ✅ Частичное обновление товара по ID
- ✅ Удаление товара по ID
- ✅ Поиск товаров по названию и описанию
- ✅ Фильтрация товаров по категории

## Установка и запуск

1. Установите зависимости:
```bash
npm install
```

2. Запустите сервер в режиме разработки:
```bash
npm run dev
```

3. Или запустите в продакшн режиме:
```bash
npm start
```

Сервер будет доступен по адресу: `http://localhost:3000`

## API Эндпоинты

### Основные операции

#### GET /api/products
Получить список товаров с возможностью фильтрации

**Query параметры:**
- `category` (string, optional) - фильтр по категории
- `q` (string, optional) - поиск по названию и описанию

**Примеры запросов:**
- `GET /api/products` - все товары
- `GET /api/products?category=Электроника` - товары категории "Электроника"
- `GET /api/products?q=iPhone` - поиск по слову "iPhone"
- `GET /api/products?category=Электроника&q=iPhone` - комбинированная фильтрация

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "iPhone 15",
      "price": 999,
      "description": "Новейший смартфон от Apple",
      "category": "Электроника",
      "inStock": true
    }
  ],
  "count": 1,
  "filters": {
    "category": "Электроника",
    "search": "iPhone"
  }
}
```

#### GET /api/products/:id
Получить товар по ID

**Параметры:**
- `id` (number) - ID товара

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "iPhone 15",
    "price": 999,
    "description": "Новейший смартфон от Apple",
    "category": "Электроника",
    "inStock": true
  }
}
```

#### POST /api/products
Создать новый товар

**Тело запроса:**
```json
{
  "name": "Новый товар",
  "price": 100,
  "description": "Описание товара",
  "category": "Категория",
  "inStock": true
}
```

**Обязательные поля:** `name`, `price`

**Ответ:**
```json
{
  "success": true,
  "message": "Товар успешно создан",
  "data": {
    "id": 4,
    "name": "Новый товар",
    "price": 100,
    "description": "Описание товара",
    "category": "Категория",
    "inStock": true
  }
}
```

#### PATCH /api/products/:id
Частично обновить товар по ID

**Параметры:**
- `id` (number) - ID товара

**Тело запроса:**
```json
{
  "name": "Обновленное название",
  "price": 150,
  "description": "Новое описание",
  "category": "Новая категория",
  "inStock": false
}
```

**Поля:** Любые поля для частичного обновления (name, price, description, category, inStock)

#### DELETE /api/products/:id
Удалить товар по ID

**Параметры:**
- `id` (number) - ID товара

**Ответ:**
```json
{
  "success": true,
  "message": "Товар успешно удален",
  "data": {
    "id": 1,
    "name": "iPhone 15",
    "price": 999,
    "description": "Новейший смартфон от Apple",
    "category": "Электроника",
    "inStock": true
  }
}
```

### Дополнительные операции

#### GET /api/stats
Получить статистику по товарам

**Ответ:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 3,
    "totalInStock": 2,
    "totalOutOfStock": 1,
    "categories": ["Электроника", "Обувь"],
    "averagePrice": "1039.33",
    "priceRange": {
      "min": 120,
      "max": 1999
    }
  }
}
```

## Структура товара

```json
{
  "id": 1,
  "name": "Название товара",
  "price": 100,
  "description": "Описание товара",
  "category": "Категория",
  "inStock": true
}
```

## Коды ответов

- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Неверный запрос
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

## Примеры использования

### Получение всех товаров
```bash
curl http://localhost:3000/api/products
```

### Создание нового товара
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung Galaxy",
    "price": 800,
    "description": "Android смартфон",
    "category": "Электроника",
    "inStock": true
  }'
```

### Частичное обновление товара
```bash
curl -X PATCH http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "price": 1199,
    "description": "Профессиональный смартфон от Apple"
  }'
```

### Удаление товара
```bash
curl -X DELETE http://localhost:3000/api/products/1
```

### Поиск товаров
```bash
curl "http://localhost:3000/api/products?q=iPhone"
```

### Фильтрация по категории
```bash
curl "http://localhost:3000/api/products?category=Электроника"
```

### Комбинированная фильтрация
```bash
curl "http://localhost:3000/api/products?category=Электроника&q=iPhone"
```

### Получение статистики
```bash
curl http://localhost:3000/api/stats
```
