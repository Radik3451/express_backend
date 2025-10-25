/**
 * @typedef {Object} Category
 * @property {number} id - Уникальный идентификатор категории
 * @property {string} name - Название категории
 * @property {string} description - Описание категории
 * @property {string} created_at - Дата создания
 * @property {string} updated_at - Дата обновления
 */

/**
 * @typedef {Object} CreateCategoryData
 * @property {string} name - Название категории
 * @property {string} [description] - Описание категории
 */

/**
 * @typedef {Object} UpdateCategoryData
 * @property {string} [name] - Название категории
 * @property {string} [description] - Описание категории
 */

const database = require('../config/database');

/**
 * Модель для работы с категориями
 */
class CategoryModel {
  /**
   * Получить все категории
   * @returns {Promise<Category[]>} Массив всех категорий
   */
  async getAllCategories() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = `
        SELECT 
          id, 
          name, 
          description, 
          created_at, 
          updated_at,
          (SELECT COUNT(*) FROM products WHERE category_id = categories.id) as products_count
        FROM categories 
        ORDER BY name ASC
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
   * Получить категорию по ID
   * @param {number} id - ID категории
   * @returns {Promise<Category|null>} Категория или null если не найдена
   */
  async getCategoryById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = `
        SELECT 
          id, 
          name, 
          description, 
          created_at, 
          updated_at,
          (SELECT COUNT(*) FROM products WHERE category_id = categories.id) as products_count
        FROM categories 
        WHERE id = ?
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
   * Создать новую категорию
   * @param {CreateCategoryData} categoryData - Данные для создания категории
   * @returns {Promise<Category>} Созданная категория
   */
  async createCategory(categoryData) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = `
        INSERT INTO categories (name, description) 
        VALUES (?, ?)
      `;
      
      // Обрабатываем значения по умолчанию
      const values = [
        categoryData.name,
        categoryData.description || ''
      ];
      
      // Сохраняем ссылку на экземпляр класса
      const self = this;
      
      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          // Получаем созданную категорию по lastID
          const categoryId = this.lastID;
          // Используем сохраненную ссылку на экземпляр класса
          self.getCategoryById(categoryId).then(resolve).catch(reject);
        }
      });
    });
  }

  /**
   * Обновить категорию
   * @param {number} id - ID категории
   * @param {UpdateCategoryData} categoryData - Данные для обновления
   * @returns {Promise<Category|null>} Обновленная категория или null если не найдена
   */
  async updateCategory(id, categoryData) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      // Формируем динамический запрос
      const fields = [];
      const values = [];
      
      if (categoryData.name !== undefined) {
        fields.push('name = ?');
        values.push(categoryData.name);
      }
      
      if (categoryData.description !== undefined) {
        fields.push('description = ?');
        values.push(categoryData.description);
      }
      
      if (fields.length === 0) {
        resolve(null);
        return;
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
      
      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          // Получаем обновленную категорию
          this.getCategoryById(id).then(resolve).catch(reject);
        }
      }.bind(this));
    });
  }

  /**
   * Удалить категорию
   * @param {number} id - ID категории
   * @returns {Promise<Category|null>} Удаленная категория или null если не найдена
   */
  async deleteCategory(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      // Сначала получаем категорию
      this.getCategoryById(id).then(category => {
        if (!category) {
          resolve(null);
          return;
        }
        
        // Удаляем категорию (товары останутся с category_id = NULL)
        const query = 'DELETE FROM categories WHERE id = ?';
        db.run(query, [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(category);
          }
        });
      }).catch(reject);
    });
  }

  /**
   * Проверить существование категории с таким именем
   * @param {string} name - Название категории
   * @param {number|null} excludeId - ID категории для исключения из поиска
   * @returns {Promise<Category|null>} Категория с таким именем или null
   */
  async findCategoryByName(name, excludeId = null) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      let query = 'SELECT * FROM categories WHERE LOWER(name) = LOWER(?)';
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
   * Получить количество категорий
   * @returns {Promise<number>} Количество категорий
   */
  async getCategoriesCount() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = 'SELECT COUNT(*) as count FROM categories';
      
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

module.exports = new CategoryModel();
