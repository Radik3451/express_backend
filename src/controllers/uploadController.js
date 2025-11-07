/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const path = require('path');
const { saveFile, deleteFile, fileExists, getFileInfo } = require('../utils/fileUtils');

class UploadController {
  /**
   * Загрузить файл
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async uploadFile(req, res) {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({
          success: false,
          message: 'Файл не был загружен'
        });
      }

      const file = req.files.file;
      const uploadedFile = await saveFile(file, 'uploads');

      res.json({
        success: true,
        message: 'Файл успешно загружен',
        data: {
          file: uploadedFile
        }
      });
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при загрузке файла'
      });
    }
  }

  /**
   * Получить конкретный файл по названию
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async getFile(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../../uploads', filename);

      // Проверяем существование файла
      const exists = await fileExists(filePath);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Файл не найден.'
        });
      }

      // Получаем информацию о файле
      const fileInfo = await getFileInfo(filePath);

      res.json({
        success: true,
        data: {
          name: filename,
          size: fileInfo.size,
          created: fileInfo.created.toISOString(),
          modified: fileInfo.modified.toISOString(),
          url: `/uploads/${filename}`
        }
      });
    } catch (error) {
      console.error('Ошибка при получении файла:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении файла'
      });
    }
  }

  /**
   * Получить информацию о загруженных файлах
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async getUploadedFiles(req, res) {
    try {
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(__dirname, '../../uploads');
      
      // Проверяем существование папки uploads
      if (!fs.existsSync(uploadsDir)) {
        return res.json({
          success: true,
          data: [],
          count: 0
        });
      }
      
      // Получаем список файлов
      const files = fs.readdirSync(uploadsDir);
      const fileList = files.map(fileName => {
        const filePath = path.join(uploadsDir, fileName);
        const stats = fs.statSync(filePath);
        
        return {
          name: fileName,
          size: stats.size,
          created: stats.birthtime,
          url: `/uploads/${fileName}`
        };
      });
      
      res.json({
        success: true,
        data: fileList,
        count: fileList.length
      });
    } catch (error) {
      console.error('Ошибка при получении списка файлов:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении списка файлов'
      });
    }
  }

  /**
   * Удалить файл
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   */
  async deleteUploadedFile(req, res) {
    try {
      const fileName = req.params.filename;
      const filePath = path.join(__dirname, '../../uploads', fileName);

      // Проверяем существование файла
      const exists = await fileExists(filePath);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: 'Файл не найден'
        });
      }

      // Удаляем файл
      await deleteFile(filePath);

      res.json({
        success: true,
        message: 'Файл успешно удален',
        data: {
          filename: fileName
        }
      });
    } catch (error) {
      console.error('Ошибка при удалении файла:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении файла'
      });
    }
  }
}

module.exports = new UploadController();
