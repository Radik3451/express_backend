const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateIdParam
} = require('../middleware');

// Маршруты для категорий (все защищены JWT)

// GET /api/categories - получить все категории
router.get('/', authenticateToken, categoriesController.getAllCategories);

// GET /api/categories/:id - получить категорию по ID
router.get('/:id', authenticateToken, validateIdParam, categoriesController.getCategoryById);

// POST /api/categories - создать новую категорию
router.post('/', authenticateToken, validateCreateCategory, categoriesController.createCategory);

// PATCH /api/categories/:id - обновить категорию по ID
router.patch('/:id', authenticateToken, validateIdParam, validateUpdateCategory, categoriesController.updateCategory);

// DELETE /api/categories/:id - удалить категорию по ID
router.delete('/:id', authenticateToken, validateIdParam, categoriesController.deleteCategory);

module.exports = router;
