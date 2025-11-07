const path = require('path');
const fs = require('fs');

/**
 * Генерирует уникальное имя файла
 * @param {string} originalName - Оригинальное имя файла
 * @returns {string} Уникальное имя файла
 */
const generateUniqueFileName = (originalName) => {
  const fileExtension = path.extname(originalName);
  return `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
};

/**
 * Сохраняет файл на диск
 * @param {Object} file - Объект файла из express-fileupload
 * @param {string} uploadPath - Путь для сохранения файла
 * @returns {Promise<Object>} Информация о сохраненном файле
 */
const saveFile = async (file, uploadPath = 'uploads') => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Файл не предоставлен'));
      return;
    }

    const fileName = generateUniqueFileName(file.name);
    const filePath = path.join(uploadPath, fileName);

    file.mv(filePath, (err) => {
      if (err) {
        console.error('Ошибка сохранения файла:', err);
        reject(err);
      } else {
        resolve({
          name: fileName,
          originalName: file.name,
          path: filePath,
          size: file.size,
          mimetype: file.mimetype,
          url: `/uploads/${fileName}`
        });
      }
    });
  });
};

/**
 * Удаляет файл с диска
 * @param {string} filePath - Путь к файлу
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
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

/**
 * Проверяет существование файла
 * @param {string} filePath - Путь к файлу
 * @returns {Promise<boolean>}
 */
const fileExists = async (filePath) => {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      resolve(!err);
    });
  });
};

/**
 * Получает информацию о файле
 * @param {string} filePath - Путь к файлу
 * @returns {Promise<Object>}
 */
const getFileInfo = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        });
      }
    });
  });
};

module.exports = {
  generateUniqueFileName,
  saveFile,
  deleteFile,
  fileExists,
  getFileInfo
};
