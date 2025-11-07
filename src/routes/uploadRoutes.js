const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');
const { checkEmailVerification } = require('../middleware/emailVerification');
const { validateFileType } = require('../middleware/upload');

// Маршруты для загрузки файлов (все защищены JWT)

// POST /api/upload - загрузить файл
router.post('/',
  authenticateToken,
  checkEmailVerification,
  validateFileType(),
  uploadController.uploadFile
);

// GET /api/upload - получить список загруженных файлов
router.get('/', authenticateToken, checkEmailVerification, uploadController.getUploadedFiles);

// GET /api/upload/:filename - получить информацию о конкретном файле
router.get('/:filename', authenticateToken, checkEmailVerification, uploadController.getFile);

// DELETE /api/upload/:filename - удалить файл
router.delete('/:filename', authenticateToken, checkEmailVerification, uploadController.deleteUploadedFile);

module.exports = router;
