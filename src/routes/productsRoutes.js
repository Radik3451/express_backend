const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

// Маршруты для товаров

// GET /api/products - получить все товары с фильтрацией
router.get('/', productsController.getAllProducts);

// GET /api/products/:id - получить товар по ID
router.get('/:id', productsController.getProductById);

// POST /api/products - создать новый товар
router.post('/', productsController.createProduct);

// PATCH /api/products/:id - обновить товар по ID
router.patch('/:id', productsController.updateProduct);

// DELETE /api/products/:id - удалить товар по ID
router.delete('/:id', productsController.deleteProduct);

module.exports = router;
