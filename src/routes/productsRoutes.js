const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { authenticateToken } = require('../middleware/auth');
const { checkEmailVerification } = require('../middleware/emailVerification');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateIdParam,
  validateFilterProducts,
  managerOrAdmin
} = require('../middleware');

// Маршруты для товаров (все защищены JWT)

// GET /api/products - получить все товары с фильтрацией (все авторизованные пользователи)
router.get('/', authenticateToken, checkEmailVerification, validateFilterProducts, productsController.getAllProducts);

// GET /api/products/:id - получить товар по ID (все авторизованные пользователи)
router.get('/:id', authenticateToken, checkEmailVerification, validateIdParam, productsController.getProductById);

// POST /api/products - создать новый товар (только manager и admin)
router.post('/', authenticateToken, checkEmailVerification, managerOrAdmin, validateCreateProduct, productsController.createProduct);

// PATCH /api/products/:id - обновить товар по ID (только manager и admin)
router.patch('/:id', authenticateToken, checkEmailVerification, managerOrAdmin, validateIdParam, validateUpdateProduct, productsController.updateProduct);

// DELETE /api/products/:id - удалить товар по ID (только manager и admin)
router.delete('/:id', authenticateToken, checkEmailVerification, managerOrAdmin, validateIdParam, productsController.deleteProduct);

module.exports = router;
