const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateCreateOrder,
  validateUpdateOrder,
  validateIdParam
} = require('../middleware');

// Все роуты требуют авторизации

// GET /api/orders - получить заказы текущего пользователя
router.get('/', authenticateToken, ordersController.getUserOrders);

// GET /api/orders/:id - получить заказ по ID
router.get('/:id', authenticateToken, validateIdParam, ordersController.getOrderById);

// GET /api/orders/:id/items - получить товары заказа
router.get('/:id/items', authenticateToken, validateIdParam, ordersController.getOrderItems);

// POST /api/orders - создать новый заказ
router.post('/', authenticateToken, validateCreateOrder, ordersController.createOrder);

// PATCH /api/orders/:id - обновить заказ
router.patch('/:id', authenticateToken, validateIdParam, validateUpdateOrder, ordersController.updateOrder);

// DELETE /api/orders/:id - удалить заказ
router.delete('/:id', authenticateToken, validateIdParam, ordersController.deleteOrder);

module.exports = router;
