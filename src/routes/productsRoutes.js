const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { authenticateToken } = require('../middleware/auth');
const { checkEmailVerification } = require('../middleware/emailVerification');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateIdParam,
  validateFilterProducts
} = require('../middleware');

// Маршруты для товаров (все защищены JWT)

// GET /api/products - получить все товары с фильтрацией
router.get('/', authenticateToken, checkEmailVerification, validateFilterProducts, productsController.getAllProducts);

// GET /api/products/:id - получить товар по ID
router.get('/:id', authenticateToken, checkEmailVerification, validateIdParam, productsController.getProductById);

// POST /api/products - создать новый товар
router.post('/', authenticateToken, checkEmailVerification, validateCreateProduct, productsController.createProduct);

// PATCH /api/products/:id - обновить товар по ID
router.patch('/:id', authenticateToken, checkEmailVerification, validateIdParam, validateUpdateProduct, productsController.updateProduct);

// DELETE /api/products/:id - удалить товар по ID
router.delete('/:id', authenticateToken, checkEmailVerification, validateIdParam, productsController.deleteProduct);

module.exports = router;
