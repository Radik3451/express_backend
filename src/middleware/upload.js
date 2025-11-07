const fileUpload = require('express-fileupload');

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

module.exports = {
  uploadMiddleware,
  validateFileType
};
