const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const { authenticateToken } = require('../middleware/auth');
const { checkEmailVerification } = require('../middleware/emailVerification');
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateIdParam
} = require('../middleware');

// Маршруты для категорий (все защищены JWT)

// GET /api/categories - получить все категории
router.get('/', authenticateToken, checkEmailVerification, categoriesController.getAllCategories);

// GET /api/categories/:id - получить категорию по ID
router.get('/:id', authenticateToken, checkEmailVerification, validateIdParam, categoriesController.getCategoryById);

// POST /api/categories - создать новую категорию
router.post('/', authenticateToken, checkEmailVerification, validateCreateCategory, categoriesController.createCategory);

// PATCH /api/categories/:id - обновить категорию по ID
router.patch('/:id', authenticateToken, checkEmailVerification, validateIdParam, validateUpdateCategory, categoriesController.updateCategory);

// DELETE /api/categories/:id - удалить категорию по ID
router.delete('/:id', authenticateToken, checkEmailVerification, validateIdParam, categoriesController.deleteCategory);

module.exports = router;
