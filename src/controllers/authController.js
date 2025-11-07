/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../models/users');
const database = require('../config/database');
const emailService = require('../utils/emailService');

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
    this.verifyEmail = this.verifyEmail.bind(this);
    this.resendVerificationEmail = this.resendVerificationEmail.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
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

      // Генерируем токен подтверждения email заранее
      const verificationToken = emailService.generateVerificationToken();
      const verificationTokenExpiresAt = new Date();
      verificationTokenExpiresAt.setHours(verificationTokenExpiresAt.getHours() + 24); // 24 часа

      // Сначала проверяем возможность отправки письма
      try {
        await emailService.sendVerificationEmail(email.trim().toLowerCase(), username.trim(), verificationToken);
      } catch (emailError) {
        return res.status(500).json({
          success: false,
          message: 'Не удалось отправить письмо с подтверждением. Проверьте корректность email адреса и попробуйте позже.'
        });
      }

      // Только после успешной отправки письма создаем пользователя
      const newUser = await userModel.createUser(userData);

      // Сохраняем токен в базе данных
      await userModel.saveEmailVerificationToken(newUser.id, verificationToken, verificationTokenExpiresAt);

      // Генерируем токены
      const tokens = this.generateTokens(newUser);

      res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован. Проверьте вашу почту для подтверждения email.',
        data: {
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            email_verified: false,
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

      res.json({
        success: true,
        message: 'Успешная авторизация',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            email_verified: Boolean(user.email_verified),
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

      // Проверяем и декодируем refresh токен
      let decoded;
      try {
        decoded = jwt.verify(refresh_token, this.jwtRefreshSecret);
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: 'Недействительный или просроченный refresh токен'
        });
      }

      // Проверяем тип токена
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          message: 'Недействительный тип токена'
        });
      }

      // Получаем пользователя из базы данных
      const user = await userModel.getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      // Генерируем новые токены
      const tokens = this.generateTokens(user);

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
   * Выход из системы
   * @param {Request} _req - Express request объект (не используется)
   * @param {Response} res - Express response объект
   * @note Refresh токены больше не хранятся на сервере - клиент должен удалить их локально
   */
  async logout(_req, res) {
    try {
      // Refresh токены не хранятся в БД, поэтому logout просто подтверждает выход
      // Клиент должен удалить токены из своего хранилища (localStorage, cookies и т.д.)

      res.json({
        success: true,
        message: 'Успешный выход из системы. Удалите токены на клиенте.'
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
            email_verified: Boolean(user.email_verified),
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
              email_verified: Boolean(updatedUser.email_verified),
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

  /**
   * Подтверждение email по токену
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Токен подтверждения не предоставлен'
        });
      }

      // Находим пользователя по токену
      const user = await userModel.findByEmailVerificationToken(token);

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Недействительный или просроченный токен подтверждения'
        });
      }

      // Проверяем, не подтвержден ли уже email
      if (user.email_verified) {
        return res.status(400).json({
          success: false,
          message: 'Email уже подтвержден'
        });
      }

      // Подтверждаем email
      await userModel.verifyEmail(user.id);

      res.json({
        success: true,
        message: 'Email успешно подтвержден! Теперь у вас есть полный доступ к сервису.'
      });
    } catch (error) {
      console.error('Ошибка при подтверждении email:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при подтверждении email'
      });
    }
  }

  /**
   * Повторная отправка письма с подтверждением email
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async resendVerificationEmail(req, res) {
    try {
      const userId = req.user.userId;

      // Получаем пользователя
      const user = await userModel.getUserByEmail(req.user.email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      // Проверяем, не подтвержден ли уже email
      if (user.email_verified) {
        return res.status(400).json({
          success: false,
          message: 'Email уже подтвержден'
        });
      }

      // Генерируем новый токен подтверждения
      const verificationToken = emailService.generateVerificationToken();
      const verificationTokenExpiresAt = new Date();
      verificationTokenExpiresAt.setHours(verificationTokenExpiresAt.getHours() + 24); // 24 часа

      // Сохраняем токен в базе данных
      await userModel.saveEmailVerificationToken(userId, verificationToken, verificationTokenExpiresAt);

      // Отправляем письмо с подтверждением
      await emailService.sendVerificationEmail(user.email, user.username, verificationToken);

      res.json({
        success: true,
        message: 'Письмо с подтверждением отправлено повторно. Проверьте вашу почту.'
      });
    } catch (error) {
      console.error('Ошибка при повторной отправке письма:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при отправке письма с подтверждением'
      });
    }
  }

  /**
   * Запрос на сброс пароля (отправка письма с токеном)
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Ищем пользователя по email
      const user = await userModel.getUserByEmail(email);

      // Не раскрываем информацию о существовании пользователя
      if (!user) {
        return res.json({
          success: true,
          message: 'Если пользователь с таким email существует, на него будет отправлено письмо с инструкциями по сбросу пароля.'
        });
      }

      // Генерируем JWT токен для сброса пароля (действителен 1 час)
      const resetToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          type: 'password-reset'
        },
        this.jwtSecret,
        { expiresIn: '1h' }
      );

      // Отправляем письмо с токеном
      await emailService.sendPasswordResetEmail(user.email, user.username, resetToken);

      res.json({
        success: true,
        message: 'Если пользователь с таким email существует, на него будет отправлено письмо с инструкциями по сбросу пароля.'
      });
    } catch (error) {
      console.error('Ошибка при запросе сброса пароля:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обработке запроса на сброс пароля'
      });
    }
  }

  /**
   * Сброс пароля по токену
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async resetPassword(req, res) {
    try {
      const { token, new_password } = req.body;

      if (!token || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'Токен и новый пароль обязательны'
        });
      }

      // Проверяем и декодируем токен
      let decoded;
      try {
        decoded = jwt.verify(token, this.jwtSecret);
      } catch (jwtError) {
        return res.status(400).json({
          success: false,
          message: 'Недействительный или просроченный токен сброса пароля'
        });
      }

      // Проверяем тип токена
      if (decoded.type !== 'password-reset') {
        return res.status(400).json({
          success: false,
          message: 'Недействительный тип токена'
        });
      }

      // Получаем пользователя
      const user = await userModel.getUserById(decoded.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      // Проверяем, что email в токене совпадает с email пользователя
      if (user.email !== decoded.email) {
        return res.status(400).json({
          success: false,
          message: 'Недействительный токен'
        });
      }

      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(new_password, 10);

      // Обновляем пароль в базе данных
      const db = database.getDb();
      db.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, user.id],
        (err) => {
          if (err) {
            console.error('Ошибка при обновлении пароля:', err);
            return res.status(500).json({
              success: false,
              message: 'Ошибка при обновлении пароля'
            });
          }

          res.json({
            success: true,
            message: 'Пароль успешно изменен. Теперь вы можете войти с новым паролем.'
          });
        }
      );
    } catch (error) {
      console.error('Ошибка при сбросе пароля:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при сбросе пароля'
      });
    }
  }
}

module.exports = new AuthController();
