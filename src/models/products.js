/**
 * @typedef {Object} Product
 * @property {number} id - Уникальный идентификатор товара
 * @property {string} name - Название товара
 * @property {number} price - Цена товара
 * @property {string} description - Описание товара
 * @property {number|null} category_id - ID категории товара
 * @property {string|null} category_name - Название категории товара
 * @property {boolean} in_stock - Наличие товара на складе
 * @property {string} created_at - Дата создания
 * @property {string} updated_at - Дата обновления
 */

/**
 * @typedef {Object} CreateProductData
 * @property {string} name - Название товара
 * @property {number} price - Цена товара
 * @property {string} [description] - Описание товара
 * @property {number} [category_id] - ID категории товара
 * @property {boolean} [in_stock] - Наличие товара на складе
 */

/**
 * @typedef {Object} UpdateProductData
 * @property {string} [name] - Название товара
 * @property {number} [price] - Цена товара
 * @property {string} [description] - Описание товара
 * @property {number} [category_id] - ID категории товара
 * @property {boolean} [in_stock] - Наличие товара на складе
 */

const database = require('../config/database');

/**
 * Модель для работы с товарами
 */
class ProductModel {

  /**
   * Получить все товары
   * @returns {Promise<Product[]>} Массив всех товаров
   */
  async getAllProducts() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = `
        SELECT 
          p.id, 
          p.name, 
          p.price, 
          p.description, 
          p.category_id,
          c.name as category_name,
          p.in_stock, 
          p.created_at, 
          p.updated_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.name ASC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Получить товар по ID
   * @param {number} id - ID товара
   * @returns {Promise<Product|null>} Товар или null если не найден
   */
  async getProductById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = `
        SELECT 
          p.id, 
          p.name, 
          p.price, 
          p.description, 
          p.category_id,
          c.name as category_name,
          p.in_stock, 
          p.created_at, 
          p.updated_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Создать новый товар
   * @param {CreateProductData} productData - Данные для создания товара
   * @returns {Promise<Product>} Созданный товар
   */
  async createProduct(productData) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = `
        INSERT INTO products (name, price, description, category_id, in_stock) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      // Обрабатываем значения по умолчанию
      const values = [
        productData.name,
        productData.price,
        productData.description || '',
        productData.category_id || null,
        productData.in_stock !== undefined ? productData.in_stock : true
      ];
      
      // Сохраняем ссылку на экземпляр класса
      const self = this;
      
      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          // Получаем созданный товар по lastID
          const productId = this.lastID;
          // Используем сохраненную ссылку на экземпляр класса
          self.getProductById(productId).then(resolve).catch(reject);
        }
      });
    });
  }

  /**
   * Частично обновить товар (PATCH)
   * @param {number} id - ID товара
   * @param {UpdateProductData} productData - Данные для обновления
   * @returns {Promise<Product|null>} Обновленный товар или null если не найден
   */
  async updateProduct(id, productData) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      // Формируем динамический запрос
      const fields = [];
      const values = [];
      
      if (productData.name !== undefined) {
        fields.push('name = ?');
        values.push(productData.name);
      }
      
      if (productData.price !== undefined) {
        fields.push('price = ?');
        values.push(productData.price);
      }
      
      if (productData.description !== undefined) {
        fields.push('description = ?');
        values.push(productData.description);
      }
      
      if (productData.category_id !== undefined) {
        fields.push('category_id = ?');
        values.push(productData.category_id);
      }
      
      if (productData.in_stock !== undefined) {
        fields.push('in_stock = ?');
        values.push(productData.in_stock);
      }
      
      if (fields.length === 0) {
        resolve(null);
        return;
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
      
      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          // Получаем обновленный товар
          this.getProductById(id).then(resolve).catch(reject);
        }
      }.bind(this));
    });
  }

  /**
   * Удалить товар
   * @param {number} id - ID товара
   * @returns {Promise<Product|null>} Удаленный товар или null если не найден
   */
  async deleteProduct(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      // Сначала получаем товар
      this.getProductById(id).then(product => {
        if (!product) {
          resolve(null);
          return;
        }
        
        // Удаляем товар
        const query = 'DELETE FROM products WHERE id = ?';
        db.run(query, [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(product);
          }
        });
      }).catch(reject);
    });
  }

  /**
   * Получить товары по категории
   * @param {number} categoryId - ID категории
   * @returns {Promise<Product[]>} Массив товаров в указанной категории
   */
  async getProductsByCategory(categoryId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = `
        SELECT 
          p.id, 
          p.name, 
          p.price, 
          p.description, 
          p.category_id,
          c.name as category_name,
          p.in_stock, 
          p.created_at, 
          p.updated_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ?
        ORDER BY p.name ASC
      `;
      
      db.all(query, [categoryId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Поиск товаров
   * @param {string} query - Поисковый запрос
   * @returns {Promise<Product[]>} Массив найденных товаров
   */
  async searchProducts(query) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const searchQuery = `
        SELECT 
          p.id, 
          p.name, 
          p.price, 
          p.description, 
          p.category_id,
          c.name as category_name,
          p.in_stock, 
          p.created_at, 
          p.updated_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE LOWER(p.name) LIKE LOWER(?) OR LOWER(p.description) LIKE LOWER(?)
        ORDER BY p.name ASC
      `;
      
      const searchTerm = `%${query}%`;
      db.all(searchQuery, [searchTerm, searchTerm], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Проверить существование товара с таким именем
   * @param {string} name - Название товара
   * @param {number|null} excludeId - ID товара для исключения из поиска
   * @returns {Promise<Product|null>} Товар с таким именем или null
   */
  async findProductByName(name, excludeId = null) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      let query = 'SELECT * FROM products WHERE LOWER(name) = LOWER(?)';
      const params = [name];
      
      if (excludeId !== null) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Получить количество товаров
   * @returns {Promise<number>} Количество товаров
   */
  async getProductsCount() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = 'SELECT COUNT(*) as count FROM products';
      
      db.get(query, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }
}

module.exports = new ProductModel();