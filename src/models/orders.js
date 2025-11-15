const database = require('../config/database');

/**
 * Модель для работы с заказами
 */
class OrderModel {
  /**
   * Получить все заказы пользователя
   * @param {number} userId - ID пользователя
   * @returns {Promise<Array>}
   */
  async getUserOrders(userId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.all(
        `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  /**
   * Получить заказ по ID
   * @param {number} orderId - ID заказа
   * @param {number} userId - ID пользователя (для проверки владельца)
   * @returns {Promise<Object|null>}
   */
  async getOrderById(orderId, userId = null) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      let query = 'SELECT * FROM orders WHERE id = ?';
      const params = [orderId];

      if (userId !== null) {
        query += ' AND user_id = ?';
        params.push(userId);
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
   * Получить товары заказа
   * @param {number} orderId - ID заказа
   * @returns {Promise<Array>}
   */
  async getOrderItems(orderId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.all(
        `SELECT
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.price,
          oi.created_at,
          p.name as product_name,
          p.description as product_description
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?`,
        [orderId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  /**
   * Создать новый заказ
   * @param {Object} orderData - Данные заказа
   * @param {Array} items - Товары заказа
   * @returns {Promise<Object>}
   */
  async createOrder(orderData, items) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Создаем заказ
        db.run(
          `INSERT INTO orders (user_id, status, total_amount, delivery_address, phone, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderData.user_id,
            orderData.status || 'pending',
            orderData.total_amount,
            orderData.delivery_address || null,
            orderData.phone || null,
            orderData.notes || null
          ],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }

            const orderId = this.lastID;

            // Добавляем товары заказа
            const stmt = db.prepare(
              `INSERT INTO order_items (order_id, product_id, quantity, price)
               VALUES (?, ?, ?, ?)`
            );

            try {
              items.forEach(item => {
                stmt.run(orderId, item.product_id, item.quantity, item.price);
              });

              stmt.finalize((err) => {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                } else {
                  db.run('COMMIT');
                  resolve({ id: orderId, ...orderData });
                }
              });
            } catch (error) {
              db.run('ROLLBACK');
              reject(error);
            }
          }
        );
      });
    });
  }

  /**
   * Обновить статус заказа
   * @param {number} orderId - ID заказа
   * @param {string} status - Новый статус
   * @param {number} userId - ID пользователя (для проверки владельца)
   * @returns {Promise<void>}
   */
  async updateOrderStatus(orderId, status, userId = null) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      let query = 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      const params = [status, orderId];

      if (userId !== null) {
        query += ' AND user_id = ?';
        params.push(userId);
      }

      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Заказ не найден или у вас нет прав на его изменение'));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Обновить данные заказа
   * @param {number} orderId - ID заказа
   * @param {Object} updateData - Данные для обновления
   * @param {number} userId - ID пользователя (для проверки владельца)
   * @returns {Promise<void>}
   */
  async updateOrder(orderId, updateData, userId = null) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const fields = [];
      const values = [];

      if (updateData.status !== undefined) {
        fields.push('status = ?');
        values.push(updateData.status);
      }
      if (updateData.delivery_address !== undefined) {
        fields.push('delivery_address = ?');
        values.push(updateData.delivery_address);
      }
      if (updateData.phone !== undefined) {
        fields.push('phone = ?');
        values.push(updateData.phone);
      }
      if (updateData.notes !== undefined) {
        fields.push('notes = ?');
        values.push(updateData.notes);
      }

      if (fields.length === 0) {
        reject(new Error('Нет данных для обновления'));
        return;
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(orderId);

      let query = `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`;

      if (userId !== null) {
        query += ' AND user_id = ?';
        values.push(userId);
      }

      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Заказ не найден или у вас нет прав на его изменение'));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Удалить заказ
   * @param {number} orderId - ID заказа
   * @param {number} userId - ID пользователя (для проверки владельца)
   * @returns {Promise<void>}
   */
  async deleteOrder(orderId, userId = null) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      let query = 'DELETE FROM orders WHERE id = ?';
      const params = [orderId];

      if (userId !== null) {
        query += ' AND user_id = ?';
        params.push(userId);
      }

      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Заказ не найден или у вас нет прав на его удаление'));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Получить все заказы (для админа)
   * @returns {Promise<Array>}
   */
  async getAllOrders() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      db.all(
        `SELECT
          o.*,
          u.username,
          u.email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }
}

module.exports = new OrderModel();
