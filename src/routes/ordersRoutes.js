const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateCreateOrder,
  validateUpdateOrder,
  validateIdParam,
  adminOnly
} = require('../middleware');

// Все роуты требуют авторизации

// GET /api/orders/all - получить все заказы (только admin)
router.get('/all', authenticateToken, adminOnly, ordersController.getAllOrders);

// GET /api/orders - получить заказы текущего пользователя (все авторизованные)
router.get('/', authenticateToken, ordersController.getUserOrders);

// GET /api/orders/:id - получить заказ по ID (владелец заказа)
router.get('/:id', authenticateToken, validateIdParam, ordersController.getOrderById);

// GET /api/orders/:id/items - получить товары заказа (владелец заказа)
router.get('/:id/items', authenticateToken, validateIdParam, ordersController.getOrderItems);

// POST /api/orders - создать новый заказ (все авторизованные)
router.post('/', authenticateToken, validateCreateOrder, ordersController.createOrder);

// PATCH /api/orders/:id - обновить заказ (владелец заказа)
router.patch('/:id', authenticateToken, validateIdParam, validateUpdateOrder, ordersController.updateOrder);

// DELETE /api/orders/:id - удалить заказ (владелец заказа)
router.delete('/:id', authenticateToken, validateIdParam, ordersController.deleteOrder);

module.exports = router;
