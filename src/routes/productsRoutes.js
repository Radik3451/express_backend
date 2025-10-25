const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateIdParam,
  validateFilterProducts
} = require('../middleware');

// Маршруты для товаров (все защищены JWT)

// GET /api/products - получить все товары с фильтрацией
router.get('/', authenticateToken, validateFilterProducts, productsController.getAllProducts);

// GET /api/products/:id - получить товар по ID
router.get('/:id', authenticateToken, validateIdParam, productsController.getProductById);

// POST /api/products - создать новый товар
router.post('/', authenticateToken, validateCreateProduct, productsController.createProduct);

// PATCH /api/products/:id - обновить товар по ID
router.patch('/:id', authenticateToken, validateIdParam, validateUpdateProduct, productsController.updateProduct);

// DELETE /api/products/:id - удалить товар по ID
router.delete('/:id', authenticateToken, validateIdParam, productsController.deleteProduct);

module.exports = router;
