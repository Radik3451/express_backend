const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

/**
 * Middleware для загрузки файлов
 */
const uploadMiddleware = fileUpload({
  createParentPath: true, // Создавать папки если их нет
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB лимит
  },
  abortOnLimit: true, // Прерывать при превышении лимита
  responseOnLimit: 'Размер файла превышает 5MB',
  limitHandler: (req, res, next) => {
    res.status(413).json({
      success: false,
      message: 'Размер файла превышает 5MB'
    });
  },
  useTempFiles: false, // НЕ использовать временные файлы - работать с буфером
      debug: false // Отключить отладку
});

/**
 * Middleware для валидации типов файлов
 * @param {string[]} allowedTypes - Разрешенные типы файлов
 * @returns {Function} Express middleware
 */
const validateFileType = (allowedTypes = [
  // Изображения
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Документы
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
  'text/plain', // txt
  'application/vnd.ms-excel', // xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-powerpoint', // ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  // Архивы
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed'
]) => {
  return (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Файл не был загружен'
      });
    }

    const file = req.files.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Поле "file" обязательно'
      });
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Неподдерживаемый тип файла: ${file.mimetype}. Разрешены: изображения (JPEG, PNG, GIF, WebP, SVG), документы (PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX), архивы (ZIP, RAR, 7Z)`
      });
    }

    next();
  };
};

/**
 * Middleware для сохранения файла
 * @param {string} uploadPath - Путь для сохранения файла
 * @returns {Function} Express middleware
 */
const saveFile = (uploadPath = 'uploads') => {
  return (req, res, next) => {
    const file = req.files.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Файл не найден для сохранения'
      });
    }
    
    // Генерируем уникальное имя файла
    const fileExtension = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
    const filePath = path.join(uploadPath, fileName);
    
    // Сохраняем файл
    file.mv(filePath, (err) => {
      if (err) {
        console.error('Ошибка сохранения файла:', err);
        return res.status(500).json({
          success: false,
          message: 'Ошибка при сохранении файла'
        });
      }
      
      // Добавляем информацию о файле в запрос
      req.uploadedFile = {
        name: fileName,
        originalName: file.name,
        path: filePath,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/${fileName}`
      };
      
      next();
    });
  };
};

/**
 * Middleware для удаления файла
 * @param {string} filePath - Путь к файлу
 */
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Ошибка удаления файла:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  uploadMiddleware,
  validateFileType,
  saveFile,
  deleteFile
};
