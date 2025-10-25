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
  async getAllProducts(req, res) {
    try {
      const { category_id, q } = req.query;
      
      let products;
      
      // Фильтрация по категории
      if (category_id) {
        products = await productModel.getProductsByCategory(parseInt(category_id));
      } else {
        products = await productModel.getAllProducts();
      }
      
      // Поиск по названию и описанию
      if (q) {
        if (category_id) {
          // Если уже есть фильтр по категории, ищем только в отфильтрованных товарах
          products = products.filter(product => 
            product.name.toLowerCase().includes(q.toLowerCase()) ||
            product.description.toLowerCase().includes(q.toLowerCase())
          );
        } else {
          // Если нет фильтра по категории, ищем во всех товарах
          products = await productModel.searchProducts(q);
        }
      }
      
      res.json({
        success: true,
        data: products,
        count: products.length,
        filters: {
          category_id: category_id || null,
          search: q || null
        }
      });
    } catch (error) {
      console.error('Ошибка при получении товаров:', error);
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
  async getProductById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const product = await productModel.getProductById(id);
      
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
      console.error('Ошибка при получении товара:', error);
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
  async createProduct(req, res) {
    try {
      const { name, price, description, category_id, in_stock } = req.body;
      
      // Проверка на дублирование имени
      const existingProduct = await productModel.findProductByName(name);
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Товар с таким именем уже существует'
        });
      }
      
      // Подготавливаем данные для создания
      const productData = {
        name: name.trim(),
        price: parseFloat(price),
        description: description ? description.trim() : '',
        category_id: category_id ? parseInt(category_id) : null,
        in_stock: in_stock !== undefined ? Boolean(in_stock) : true
      };
      
      const newProduct = await productModel.createProduct(productData);
      
      res.status(201).json({
        success: true,
        message: 'Товар успешно создан',
        data: newProduct
      });
    } catch (error) {
      console.error('Ошибка при создании товара:', error);
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
  async updateProduct(req, res) {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Проверяем, что товар существует
      const existingProduct = await productModel.getProductById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Товар не найден'
        });
      }
      
      // Проверка на дублирование имени только если name передается
      if (updateData.name) {
        const duplicateProduct = await productModel.findProductByName(updateData.name, id);
        if (duplicateProduct) {
          return res.status(400).json({
            success: false,
            message: 'Товар с таким именем уже существует'
          });
        }
      }
      
      const updatedProduct = await productModel.updateProduct(id, updateData);
      
      res.json({
        success: true,
        message: 'Товар успешно обновлен',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Ошибка при обновлении товара:', error);
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
  async deleteProduct(req, res) {
    try {
      const id = parseInt(req.params.id);
      const deletedProduct = await productModel.deleteProduct(id);
      
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
      console.error('Ошибка при удалении товара:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении товара'
      });
    }
  }
}

module.exports = new ProductsController();