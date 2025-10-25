const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { validateFileType, saveFile } = require('../middleware/upload');

// Маршруты для загрузки файлов

// POST /api/upload - загрузить файл
router.post('/', 
  validateFileType(),
  saveFile('uploads'),
  uploadController.uploadFile
);

// GET /api/upload - получить список загруженных файлов
router.get('/', uploadController.getUploadedFiles);

// DELETE /api/upload/:filename - удалить файл
router.delete('/:filename', uploadController.deleteFile);

module.exports = router;
