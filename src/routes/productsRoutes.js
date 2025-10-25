const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { 
  validateCreateProduct, 
  validateUpdateProduct, 
  validateIdParam, 
  validateFilterProducts 
} = require('../middleware');

// Маршруты для товаров

// GET /api/products - получить все товары с фильтрацией
router.get('/', validateFilterProducts, productsController.getAllProducts);

// GET /api/products/:id - получить товар по ID
router.get('/:id', validateIdParam, productsController.getProductById);

// POST /api/products - создать новый товар
router.post('/', validateCreateProduct, productsController.createProduct);

// PATCH /api/products/:id - обновить товар по ID
router.patch('/:id', validateIdParam, validateUpdateProduct, productsController.updateProduct);

// DELETE /api/products/:id - удалить товар по ID
router.delete('/:id', validateIdParam, productsController.deleteProduct);

module.exports = router;
