/**
 * @typedef {Object} User
 * @property {number} id - Уникальный идентификатор пользователя
 * @property {string} username - Имя пользователя
 * @property {string} email - Email пользователя
 * @property {string} password_hash - Хеш пароля
 * @property {string} [refresh_token] - Refresh токен
 * @property {string} [refresh_token_expires_at] - Дата истечения refresh токена
 * @property {string} created_at - Дата создания
 * @property {string} updated_at - Дата обновления
 */

/**
 * @typedef {Object} CreateUserData
 * @property {string} username - Имя пользователя
 * @property {string} email - Email пользователя
 * @property {string} password - Пароль пользователя
 */

/**
 * @typedef {Object} LoginData
 * @property {string} email - Email пользователя
 * @property {string} password - Пароль пользователя
 */

const database = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Модель для работы с пользователями
 */
class UserModel {

  /**
   * Получить всех пользователей
   * @returns {Promise<User[]>} Массив всех пользователей
   */
  async getAllUsers() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = 'SELECT id, username, email, created_at, updated_at FROM users ORDER BY username ASC';

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
   * Получить пользователя по ID
   * @param {number} id - ID пользователя
   * @returns {Promise<User|null>} Пользователь или null если не найден
   */
  async getUserById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = 'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?';

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
   * Получить пользователя по email
   * @param {string} email - Email пользователя
   * @returns {Promise<User|null>} Пользователь или null если не найден
   */
  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = 'SELECT * FROM users WHERE email = ?';

      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Получить пользователя по username
   * @param {string} username - Имя пользователя
   * @returns {Promise<User|null>} Пользователь или null если не найден
   */
  async getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = 'SELECT * FROM users WHERE username = ?';

      db.get(query, [username], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Создать нового пользователя
   * @param {CreateUserData} userData - Данные для создания пользователя
   * @returns {Promise<User>} Созданный пользователь
   */
  async createUser(userData) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = database.getDb();
        
        // Хешируем пароль
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(userData.password, saltRounds);

        const query = `
          INSERT INTO users (username, email, password_hash) 
          VALUES (?, ?, ?)
        `;

        const values = [
          userData.username.trim(),
          userData.email.trim().toLowerCase(),
          passwordHash
        ];

        // Сохраняем ссылку на экземпляр класса
        const self = this;

        db.run(query, values, function(err) {
          if (err) {
            reject(err);
          } else {
            // Получаем созданного пользователя по lastID
            const userId = this.lastID;
            // Используем сохраненную ссылку на экземпляр класса
            self.getUserById(userId).then(resolve).catch(reject);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Проверить пароль пользователя
   * @param {string} password - Пароль для проверки
   * @param {string} passwordHash - Хеш пароля из базы данных
   * @returns {Promise<boolean>} Результат проверки
   */
  async verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  }

  /**
   * Проверить существование пользователя с таким email
   * @param {string} email - Email пользователя
   * @param {number|null} excludeId - ID пользователя для исключения из поиска
   * @returns {Promise<User|null>} Пользователь с таким email или null
   */
  async findUserByEmail(email, excludeId = null) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      let query = 'SELECT id, email FROM users WHERE LOWER(email) = LOWER(?)';
      const params = [email];

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
   * Проверить существование пользователя с таким username
   * @param {string} username - Имя пользователя
   * @param {number|null} excludeId - ID пользователя для исключения из поиска
   * @returns {Promise<User|null>} Пользователь с таким username или null
   */
  async findUserByUsername(username, excludeId = null) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      let query = 'SELECT id, username FROM users WHERE LOWER(username) = LOWER(?)';
      const params = [username];

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
   * Получить количество пользователей
   * @returns {Promise<number>} Количество пользователей
   */
  async getUsersCount() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  /**
   * Сохранить refresh токен для пользователя
   * @param {number} userId - ID пользователя
   * @param {string} refreshToken - Refresh токен
   * @param {Date} expiresAt - Дата истечения токена
   * @returns {Promise<void>}
   */
  async saveRefreshToken(userId, refreshToken, expiresAt) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = `
        UPDATE users 
        SET refresh_token = ?, refresh_token_expires_at = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

      db.run(query, [refreshToken, expiresAt.toISOString(), userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Найти пользователя по refresh токену
   * @param {string} refreshToken - Refresh токен
   * @returns {Promise<User|null>} Пользователь или null
   */
  async findByRefreshToken(refreshToken) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = `
        SELECT id, username, email, password_hash, refresh_token, refresh_token_expires_at, created_at, updated_at 
        FROM users 
        WHERE refresh_token = ? AND refresh_token_expires_at > datetime('now')
      `;

      db.get(query, [refreshToken], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Удалить refresh токен пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<void>}
   */
  async removeRefreshToken(userId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const query = `
        UPDATE users 
        SET refresh_token = NULL, refresh_token_expires_at = NULL, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

      db.run(query, [userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new UserModel();
