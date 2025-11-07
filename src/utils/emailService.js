const nodemailer = require('nodemailer');
const crypto = require('crypto');

/**
 * Сервис для отправки email
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  /**
   * Инициализация транспорта для отправки писем
   */
  initTransporter() {
    // Для разработки используем ethereal.email (тестовый SMTP)
    // В production используйте реальный SMTP сервер
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Production конфигурация
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true', // true для 465, false для других портов
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      console.log('📧 Email transporter инициализирован (Production)');
    } else {
      console.error('❌ Email конфигурация не найдена в .env файле');
      console.error('   Необходимо указать: EMAIL_HOST, EMAIL_USER, EMAIL_PASS');
      process.exit(1);
    }
  }

  /**
   * Генерация токена для подтверждения email
   * @returns {string} Уникальный токен
   */
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Отправка письма с подтверждением email
   * @param {string} email - Email получателя
   * @param {string} username - Имя пользователя
   * @param {string} verificationToken - Токен для подтверждения
   * @returns {Promise<Object>} Результат отправки
   */
  async sendVerificationEmail(email, username, verificationToken) {
    try {
      const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Products API'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
        to: email,
        subject: 'Подтверждение email',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 20px; }
                .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Подтверждение Email</h1>
                </div>
                <div class="content">
                  <p>Здравствуйте, <strong>${username}</strong>!</p>
                  <p>Спасибо за регистрацию в нашем сервисе. Для завершения регистрации, пожалуйста, подтвердите ваш email адрес.</p>
                  <p style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Подтвердить Email</a>
                  </p>
                  <p>Или скопируйте эту ссылку в браузер:</p>
                  <p style="word-break: break-all; background-color: #e9e9e9; padding: 10px; border-radius: 4px;">
                    ${verificationUrl}
                  </p>
                  <p><strong>Важно:</strong> Ссылка действительна в течение 24 часов.</p>
                  <p>Если вы не регистрировались на нашем сервисе, проигнорируйте это письмо.</p>
                </div>
                <div class="footer">
                  <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
Здравствуйте, ${username}!

Спасибо за регистрацию в нашем сервисе. Для завершения регистрации, пожалуйста, подтвердите ваш email адрес, перейдя по ссылке:

${verificationUrl}

Важно: Ссылка действительна в течение 24 часов.

Если вы не регистрировались на нашем сервисе, проигнорируйте это письмо.
        `
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    } catch (error) {
      console.error('❌ Ошибка отправки письма:', error);
      throw error;
    }
  }

  /**
   * Отправка письма с восстановлением пароля
   * @param {string} email - Email получателя
   * @param {string} username - Имя пользователя
   * @param {string} resetToken - Токен для сброса пароля
   * @returns {Promise<Object>} Результат отправки
   */
  async sendPasswordResetEmail(email, username, resetToken) {
    try {
      const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Products API'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
        to: email,
        subject: 'Восстановление пароля',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 20px; }
                .button { display: inline-block; padding: 12px 24px; background-color: #ff9800; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Восстановление пароля</h1>
                </div>
                <div class="content">
                  <p>Здравствуйте, <strong>${username}</strong>!</p>
                  <p>Вы запросили восстановление пароля. Для сброса пароля перейдите по ссылке ниже:</p>
                  <p style="text-align: center;">
                    <a href="${resetUrl}" class="button">Сбросить пароль</a>
                  </p>
                  <p>Или скопируйте эту ссылку в браузер:</p>
                  <p style="word-break: break-all; background-color: #e9e9e9; padding: 10px; border-radius: 4px;">
                    ${resetUrl}
                  </p>
                  <p><strong>Важно:</strong> Ссылка действительна в течение 1 часа.</p>
                  <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
                </div>
                <div class="footer">
                  <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
Здравствуйте, ${username}!

Вы запросили восстановление пароля. Для сброса пароля перейдите по ссылке:

${resetUrl}

Важно: Ссылка действительна в течение 1 часа.

Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
        `
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    } catch (error) {
      console.error('❌ Ошибка отправки письма:', error);
      throw error;
    }
  }

  /**
   * Проверка подключения к SMTP серверу
   * @returns {Promise<boolean>}
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ Ошибка подключения к SMTP серверу:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
