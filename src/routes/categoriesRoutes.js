const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const { 
  validateCreateCategory, 
  validateUpdateCategory, 
  validateIdParam 
} = require('../middleware');

// Маршруты для категорий

// GET /api/categories - получить все категории
router.get('/', categoriesController.getAllCategories);

// GET /api/categories/:id - получить категорию по ID
router.get('/:id', validateIdParam, categoriesController.getCategoryById);

// POST /api/categories - создать новую категорию
router.post('/', validateCreateCategory, categoriesController.createCategory);

// PATCH /api/categories/:id - обновить категорию по ID
router.patch('/:id', validateIdParam, validateUpdateCategory, categoriesController.updateCategory);

// DELETE /api/categories/:id - удалить категорию по ID
router.delete('/:id', validateIdParam, categoriesController.deleteCategory);

module.exports = router;
