const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const { authenticateToken } = require('../middleware/auth');
const { checkEmailVerification } = require('../middleware/emailVerification');
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateIdParam,
  managerOrAdmin
} = require('../middleware');

// Маршруты для категорий (все защищены JWT)

// GET /api/categories - получить все категории (все авторизованные пользователи)
router.get('/', authenticateToken, checkEmailVerification, categoriesController.getAllCategories);

// GET /api/categories/:id - получить категорию по ID (все авторизованные пользователи)
router.get('/:id', authenticateToken, checkEmailVerification, validateIdParam, categoriesController.getCategoryById);

// POST /api/categories - создать новую категорию (только manager и admin)
router.post('/', authenticateToken, checkEmailVerification, managerOrAdmin, validateCreateCategory, categoriesController.createCategory);

// PATCH /api/categories/:id - обновить категорию по ID (только manager и admin)
router.patch('/:id', authenticateToken, checkEmailVerification, managerOrAdmin, validateIdParam, validateUpdateCategory, categoriesController.updateCategory);

// DELETE /api/categories/:id - удалить категорию по ID (только manager и admin)
router.delete('/:id', authenticateToken, checkEmailVerification, managerOrAdmin, validateIdParam, categoriesController.deleteCategory);

module.exports = router;
