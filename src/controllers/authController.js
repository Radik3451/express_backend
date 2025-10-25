/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const jwt = require('jsonwebtoken');
const userModel = require('../models/users');
const database = require('../config/database');

class AuthController {
  constructor() {
    // Секретный ключ для JWT (в продакшене должен быть в переменных окружения)
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m'; // Короткоживущий access токен
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // Долгоживущий refresh токен
    
    // Привязываем методы к контексту this
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.refresh = this.refresh.bind(this);
    this.logout = this.logout.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
  }

  /**
   * Генерирует access и refresh токены
   * @param {Object} user - Данные пользователя
   * @returns {Object} Объект с токенами и их данными
   */
  generateTokens(user) {
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        email: user.email 
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      { 
        userId: user.id,
        type: 'refresh'
      },
      this.jwtRefreshSecret,
      { expiresIn: this.jwtRefreshExpiresIn }
    );

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7); // 7 дней

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt
    };
  }

  /**
   * Регистрация нового пользователя
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Проверка на дублирование email
      const existingUserByEmail = await userModel.findUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: 'Пользователь с таким email уже существует'
        });
      }

      // Проверка на дублирование username
      const existingUserByUsername = await userModel.findUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({
          success: false,
          message: 'Пользователь с таким именем уже существует'
        });
      }

      // Подготавливаем данные для создания
      const userData = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password
      };

      const newUser = await userModel.createUser(userData);

      // Генерируем токены
      const tokens = this.generateTokens(newUser);

      // Сохраняем refresh токен в базе данных
      await userModel.saveRefreshToken(newUser.id, tokens.refreshToken, tokens.refreshTokenExpiresAt);

      res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        data: {
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            created_at: newUser.created_at
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: this.jwtExpiresIn
        }
      });
    } catch (error) {
      console.error('Ошибка при регистрации пользователя:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при регистрации пользователя'
      });
    }
  }

  /**
   * Авторизация пользователя
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Ищем пользователя по email
      const user = await userModel.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Неверный email или пароль'
        });
      }

      // Проверяем пароль
      const isPasswordValid = await userModel.verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Неверный email или пароль'
        });
      }

      // Генерируем токены
      const tokens = this.generateTokens(user);

      // Сохраняем refresh токен в базе данных
      await userModel.saveRefreshToken(user.id, tokens.refreshToken, tokens.refreshTokenExpiresAt);

      res.json({
        success: true,
        message: 'Успешная авторизация',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            created_at: user.created_at
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: this.jwtExpiresIn
        }
      });
    } catch (error) {
      console.error('Ошибка при авторизации пользователя:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при авторизации пользователя'
      });
    }
  }

  /**
   * Обновление access токена с помощью refresh токена
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async refresh(req, res) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          message: 'Refresh токен не предоставлен'
        });
      }

      // Проверяем refresh токен в базе данных
      const user = await userModel.findByRefreshToken(refresh_token);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Недействительный или просроченный refresh токен'
        });
      }

      // Генерируем новые токены
      const tokens = this.generateTokens(user);

      // Обновляем refresh токен в базе данных
      await userModel.saveRefreshToken(user.id, tokens.refreshToken, tokens.refreshTokenExpiresAt);

      res.json({
        success: true,
        message: 'Токены успешно обновлены',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: this.jwtExpiresIn
        }
      });
    } catch (error) {
      console.error('Ошибка при обновлении токенов:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении токенов'
      });
    }
  }

  /**
   * Выход из системы (удаление refresh токена)
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async logout(req, res) {
    try {
      const userId = req.user.userId;

      // Удаляем refresh токен из базы данных
      await userModel.removeRefreshToken(userId);

      res.json({
        success: true,
        message: 'Успешный выход из системы'
      });
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при выходе из системы'
      });
    }
  }

  /**
   * Получить информацию о текущем пользователе
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async getProfile(req, res) {
    try {
      const user = await userModel.getUserById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        }
      });
    } catch (error) {
      console.error('Ошибка при получении профиля пользователя:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении профиля пользователя'
      });
    }
  }

  /**
   * Обновить профиль пользователя
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async updateProfile(req, res) {
    try {
      const { username, email } = req.body;
      const userId = req.user.userId;

      // Проверяем, что пользователь существует
      const existingUser = await userModel.getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      // Проверка на дублирование email (если email изменился)
      if (email && email !== existingUser.email) {
        const duplicateEmail = await userModel.findUserByEmail(email, userId);
        if (duplicateEmail) {
          return res.status(400).json({
            success: false,
            message: 'Пользователь с таким email уже существует'
          });
        }
      }

      // Проверка на дублирование username (если username изменился)
      if (username && username !== existingUser.username) {
        const duplicateUsername = await userModel.findUserByUsername(username, userId);
        if (duplicateUsername) {
          return res.status(400).json({
            success: false,
            message: 'Пользователь с таким именем уже существует'
          });
        }
      }

      // Обновляем данные пользователя
      const db = database.getDb();
      const fields = [];
      const values = [];

      if (username !== undefined) {
        fields.push('username = ?');
        values.push(username.trim());
      }
      if (email !== undefined) {
        fields.push('email = ?');
        values.push(email.trim().toLowerCase());
      }

      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Необходимо передать хотя бы одно поле для обновления'
        });
      }

      values.push(userId);
      const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

      db.run(query, values, async (err) => {
        if (err) {
          console.error('Ошибка при обновлении профиля:', err);
          return res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении профиля'
          });
        }

        // Получаем обновленного пользователя
        const updatedUser = await userModel.getUserById(userId);
        
        res.json({
          success: true,
          message: 'Профиль успешно обновлен',
          data: {
            user: {
              id: updatedUser.id,
              username: updatedUser.username,
              email: updatedUser.email,
              created_at: updatedUser.created_at,
              updated_at: updatedUser.updated_at
            }
          }
        });
      });
    } catch (error) {
      console.error('Ошибка при обновлении профиля пользователя:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении профиля пользователя'
      });
    }
  }
}

module.exports = new AuthController();
