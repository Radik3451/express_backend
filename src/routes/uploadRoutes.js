const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');
const { validateFileType } = require('../middleware/upload');

// Маршруты для загрузки файлов (все защищены JWT)

// POST /api/upload - загрузить файл
router.post('/',
  authenticateToken,
  validateFileType(),
  uploadController.uploadFile
);

// GET /api/upload - получить список загруженных файлов
router.get('/', authenticateToken, uploadController.getUploadedFiles);

// GET /api/upload/:filename - получить информацию о конкретном файле
router.get('/:filename', authenticateToken, uploadController.getFile);

// DELETE /api/upload/:filename - удалить файл
router.delete('/:filename', authenticateToken, uploadController.deleteUploadedFile);

module.exports = router;
