/**
 * @typedef {import('../models/categories')} CategoryModel
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const categoryModel = require('../models/categories');

class CategoriesController {
  /**
   * Получить все категории
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async getAllCategories(req, res) {
    try {
      const categories = await categoryModel.getAllCategories();
      
      res.json({
        success: true,
        data: categories,
        count: categories.length
      });
    } catch (error) {
      console.error('Ошибка при получении категорий:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении категорий'
      });
    }
  }

  /**
   * Получить категорию по ID
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async getCategoryById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const category = await categoryModel.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Категория не найдена'
        });
      }
      
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Ошибка при получении категории:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении категории'
      });
    }
  }

  /**
   * Создать новую категорию
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async createCategory(req, res) {
    try {
      const { name, description } = req.body;
      
      // Проверка на дублирование имени
      const existingCategory = await categoryModel.findCategoryByName(name);
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Категория с таким именем уже существует'
        });
      }
      
      // Подготавливаем данные для создания
      const categoryData = {
        name: name.trim(),
        description: description ? description.trim() : ''
      };
      
      const newCategory = await categoryModel.createCategory(categoryData);
      
      res.status(201).json({
        success: true,
        message: 'Категория успешно создана',
        data: newCategory
      });
    } catch (error) {
      console.error('Ошибка при создании категории:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании категории'
      });
    }
  }

  /**
   * Обновить категорию
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async updateCategory(req, res) {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Проверяем, что категория существует
      const existingCategory = await categoryModel.getCategoryById(id);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Категория не найдена'
        });
      }
      
      // Проверка на дублирование имени только если name передается
      if (updateData.name) {
        const duplicateCategory = await categoryModel.findCategoryByName(updateData.name, id);
        if (duplicateCategory) {
          return res.status(400).json({
            success: false,
            message: 'Категория с таким именем уже существует'
          });
        }
      }
      
      const updatedCategory = await categoryModel.updateCategory(id, updateData);
      
      res.json({
        success: true,
        message: 'Категория успешно обновлена',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Ошибка при обновлении категории:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении категории'
      });
    }
  }

  /**
   * Удалить категорию
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async deleteCategory(req, res) {
    try {
      const id = parseInt(req.params.id);
      const deletedCategory = await categoryModel.deleteCategory(id);
      
      if (!deletedCategory) {
        return res.status(404).json({
          success: false,
          message: 'Категория не найдена'
        });
      }
      
      res.json({
        success: true,
        message: 'Категория успешно удалена',
        data: deletedCategory
      });
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении категории'
      });
    }
  }
}

module.exports = new CategoriesController();
