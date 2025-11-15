const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Класс для работы с базой данных SQLite
 */
class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, '../../database.sqlite');
  }

  /**
   * Подключение к базе данных
   * @returns {Promise<void>}
   */
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Ошибка подключения к БД:', err.message);
          reject(err);
        } else {
          console.log('✅ Подключение к SQLite БД установлено');
          resolve();
        }
      });
    });
  }

  /**
   * Инициализация таблиц
   * @returns {Promise<void>}
   */
  async initTables() {
    return new Promise((resolve, reject) => {
      const createCategoriesTable = `
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createProductsTable = `
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          price REAL NOT NULL,
          description TEXT,
          category_id INTEGER,
          in_stock BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
        )
      `;

      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          email_verified BOOLEAN DEFAULT 0,
          email_verification_token TEXT,
          email_verification_token_expires_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createOrdersTable = `
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          total_amount REAL NOT NULL,
          delivery_address TEXT,
          phone TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `;

      const createOrderItemsTable = `
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          price REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
        )
      `;

      this.db.serialize(() => {
        this.db.run(createCategoriesTable, (err) => {
          if (err) {
            console.error('Ошибка создания таблицы categories:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Таблица categories создана');
        });

        this.db.run(createProductsTable, (err) => {
          if (err) {
            console.error('Ошибка создания таблицы products:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Таблица products создана');
        });

        this.db.run(createUsersTable, (err) => {
          if (err) {
            console.error('Ошибка создания таблицы users:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Таблица users создана');
        });

        this.db.run(createOrdersTable, (err) => {
          if (err) {
            console.error('Ошибка создания таблицы orders:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Таблица orders создана');
        });

        this.db.run(createOrderItemsTable, (err) => {
          if (err) {
            console.error('Ошибка создания таблицы order_items:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Таблица order_items создана');
        });

        // Добавляем начальные данные
        this.seedData().then(() => {
          console.log('✅ Начальные данные добавлены');
          resolve();
        }).catch(reject);
      });
    });
  }

  /**
   * Добавление начальных данных
   * @returns {Promise<void>}
   */
  async seedData() {
    return new Promise((resolve, reject) => {
      // Проверяем, есть ли уже данные
      this.db.get("SELECT COUNT(*) as count FROM categories", (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count > 0) {
          resolve();
          return;
        }

        // Добавляем категории
        const categories = [
          { name: 'Электроника', description: 'Электронные устройства и гаджеты' },
          { name: 'Обувь', description: 'Обувь для всех возрастов' },
          { name: 'Одежда', description: 'Модная одежда' }
        ];

        const insertCategory = this.db.prepare(`
          INSERT INTO categories (name, description) VALUES (?, ?)
        `);

        categories.forEach(category => {
          insertCategory.run(category.name, category.description);
        });

        insertCategory.finalize();

        // Добавляем товары
        const products = [
          { name: 'iPhone 15', price: 999, description: 'Новейший смартфон от Apple', category_id: 1, in_stock: 1 },
          { name: 'MacBook Pro', price: 1999, description: 'Профессиональный ноутбук для работы', category_id: 1, in_stock: 1 },
          { name: 'Nike Air Max', price: 120, description: 'Удобные кроссовки для спорта', category_id: 2, in_stock: 0 }
        ];

        const insertProduct = this.db.prepare(`
          INSERT INTO products (name, price, description, category_id, in_stock) 
          VALUES (?, ?, ?, ?, ?)
        `);

        products.forEach(product => {
          insertProduct.run(
            product.name, 
            product.price, 
            product.description, 
            product.category_id, 
            product.in_stock
          );
        });

        insertProduct.finalize();
        resolve();
      });
    });
  }

  /**
   * Получение экземпляра базы данных
   * @returns {sqlite3.Database}
   */
  getDb() {
    return this.db;
  }

  /**
   * Закрытие соединения с базой данных
   * @returns {Promise<void>}
   */
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Ошибка закрытия БД:', err.message);
            reject(err);
          } else {
            console.log('✅ Соединение с БД закрыто');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new Database();
