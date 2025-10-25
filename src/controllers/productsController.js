/**
 * @typedef {import('../models/products')} ProductModel
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const productModel = require('../models/products');

class ProductsController {
  /**
   * Получить товары с фильтрацией (по категории и/или поиск)
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  getAllProducts(req, res) {
    try {
      const { category, q } = req.query;
      
      let products = productModel.getAllProducts();
      
      // Фильтрация по категории
      if (category) {
        products = productModel.getProductsByCategory(category);
      }
      
      // Поиск по названию и описанию
      if (q) {
        if (category) {
          // Если уже есть фильтр по категории, ищем только в отфильтрованных товарах
          products = products.filter(product => 
            product.name.toLowerCase().includes(q.toLowerCase()) ||
            product.description.toLowerCase().includes(q.toLowerCase())
          );
        } else {
          // Если нет фильтра по категории, ищем во всех товарах
          products = productModel.searchProducts(q);
        }
      }
      
      res.json({
        success: true,
        data: products,
        count: products.length,
        filters: {
          category: category || null,
          search: q || null
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении товаров'
      });
    }
  }

  /**
   * Получить товар по ID
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  getProductById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const product = productModel.getProductById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Товар не найден'
        });
      }
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении товара'
      });
    }
  }

  /**
   * Создать новый товар
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  createProduct(req, res) {
    try {
      const { name, price, description, category, inStock } = req.body;
      
      // Проверка на дублирование имени
      const existingProduct = productModel.findProductByName(name);
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Товар с таким именем уже существует'
        });
      }
      
      const newProduct = productModel.createProduct({
        name,
        price,
        description,
        category,
        inStock
      });
      
      res.status(201).json({
        success: true,
        message: 'Товар успешно создан',
        data: newProduct
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании товара'
      });
    }
  }

  /**
   * Частично обновить товар (PATCH)
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  updateProduct(req, res) {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Проверяем, что товар существует
      const existingProduct = productModel.getProductById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Товар не найден'
        });
      }
      
      // Проверка на дублирование имени только если name передается
      if (updateData.name) {
        const duplicateProduct = productModel.findProductByName(updateData.name, id);
        if (duplicateProduct) {
          return res.status(400).json({
            success: false,
            message: 'Товар с таким именем уже существует'
          });
        }
      }
      
      const updatedProduct = productModel.updateProduct(id, updateData);
      
      res.json({
        success: true,
        message: 'Товар успешно обновлен',
        data: updatedProduct
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении товара'
      });
    }
  }

  /**
   * Удалить товар
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  deleteProduct(req, res) {
    try {
      const id = parseInt(req.params.id);
      const deletedProduct = productModel.deleteProduct(id);
      
      if (!deletedProduct) {
        return res.status(404).json({
          success: false,
          message: 'Товар не найден'
        });
      }
      
      res.json({
        success: true,
        message: 'Товар успешно удален',
        data: deletedProduct
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении товара'
      });
    }
  }

}

module.exports = new ProductsController();
