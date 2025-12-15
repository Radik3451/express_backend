const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');
const { checkEmailVerification } = require('../middleware/emailVerification');
const { validateFileType } = require('../middleware/upload');
const { managerOrAdmin } = require('../middleware');

// Маршруты для загрузки файлов (все защищены JWT)

// POST /api/upload - загрузить файл (только manager и admin)
router.post('/',
  authenticateToken,
  checkEmailVerification,
  managerOrAdmin,
  validateFileType(),
  uploadController.uploadFile
);

// GET /api/upload - получить список загруженных файлов (все авторизованные)
router.get('/', authenticateToken, checkEmailVerification, uploadController.getUploadedFiles);

// GET /api/upload/:filename - получить информацию о конкретном файле (все авторизованные)
router.get('/:filename', authenticateToken, checkEmailVerification, uploadController.getFile);

// DELETE /api/upload/:filename - удалить файл (только manager и admin)
router.delete('/:filename', authenticateToken, checkEmailVerification, managerOrAdmin, uploadController.deleteUploadedFile);

module.exports = router;
