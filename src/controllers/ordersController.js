/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const orderModel = require('../models/orders');
const productModel = require('../models/products');

class OrdersController {
  constructor() {
    this.getUserOrders = this.getUserOrders.bind(this);
    this.getOrderById = this.getOrderById.bind(this);
    this.getOrderItems = this.getOrderItems.bind(this);
    this.createOrder = this.createOrder.bind(this);
    this.updateOrder = this.updateOrder.bind(this);
    this.deleteOrder = this.deleteOrder.bind(this);
    this.getAllOrders = this.getAllOrders.bind(this);
  }

  /**
   * Получить все заказы текущего пользователя
   * @param {Request} req
   * @param {Response} res
   */
  async getUserOrders(req, res) {
    try {
      const userId = req.user.userId;
      const orders = await orderModel.getUserOrders(userId);

      res.json({
        success: true,
        data: orders,
        count: orders.length
      });
    } catch (error) {
      console.error('Ошибка при получении заказов пользователя:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении заказов'
      });
    }
  }

  /**
   * Получить заказ по ID
   * @param {Request} req
   * @param {Response} res
   */
  async getOrderById(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.userId;

      const order = await orderModel.getOrderById(orderId, userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Ошибка при получении заказа:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении заказа'
      });
    }
  }

  /**
   * Получить товары заказа
   * @param {Request} req
   * @param {Response} res
   */
  async getOrderItems(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.userId;

      // Проверяем, что заказ принадлежит пользователю
      const order = await orderModel.getOrderById(orderId, userId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
      }

      const items = await orderModel.getOrderItems(orderId);

      res.json({
        success: true,
        data: items,
        count: items.length
      });
    } catch (error) {
      console.error('Ошибка при получении товаров заказа:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении товаров заказа'
      });
    }
  }

  /**
   * Создать новый заказ
   * @param {Request} req
   * @param {Response} res
   */
  async createOrder(req, res) {
    try {
      const userId = req.user.userId;
      const { items, delivery_address, phone, notes } = req.body;

      // Валидация товаров и расчет общей суммы
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await productModel.getProductById(item.product_id);

        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Товар с ID ${item.product_id} не найден`
          });
        }

        if (!product.in_stock) {
          return res.status(400).json({
            success: false,
            message: `Товар "${product.name}" недоступен для заказа`
          });
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product_id: product.id,
          quantity: item.quantity,
          price: product.price
        });
      }

      const orderData = {
        user_id: userId,
        status: 'pending',
        total_amount: totalAmount,
        delivery_address,
        phone,
        notes
      };

      const newOrder = await orderModel.createOrder(orderData, orderItems);

      res.status(201).json({
        success: true,
        message: 'Заказ успешно создан',
        data: {
          id: newOrder.id,
          ...orderData
        }
      });
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании заказа'
      });
    }
  }

  /**
   * Обновить заказ
   * @param {Request} req
   * @param {Response} res
   */
  async updateOrder(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.userId;
      const updateData = req.body;

      // Проверяем, что заказ существует и принадлежит пользователю
      const order = await orderModel.getOrderById(orderId, userId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
      }

      // Запрещаем изменение завершенных заказов
      if (order.status === 'completed' || order.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Невозможно изменить завершенный или отмененный заказ'
        });
      }

      await orderModel.updateOrder(orderId, updateData, userId);

      const updatedOrder = await orderModel.getOrderById(orderId, userId);

      res.json({
        success: true,
        message: 'Заказ успешно обновлен',
        data: updatedOrder
      });
    } catch (error) {
      console.error('Ошибка при обновлении заказа:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Ошибка при обновлении заказа'
      });
    }
  }

  /**
   * Удалить заказ
   * @param {Request} req
   * @param {Response} res
   */
  async deleteOrder(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.userId;

      // Проверяем, что заказ существует и принадлежит пользователю
      const order = await orderModel.getOrderById(orderId, userId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
      }

      // Запрещаем удаление обрабатываемых заказов
      if (order.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Можно удалить только заказы в статусе "pending"'
        });
      }

      await orderModel.deleteOrder(orderId, userId);

      res.json({
        success: true,
        message: 'Заказ успешно удален',
        data: { id: orderId }
      });
    } catch (error) {
      console.error('Ошибка при удалении заказа:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Ошибка при удалении заказа'
      });
    }
  }

  /**
   * Получить все заказы (для админа)
   * @param {Request} req
   * @param {Response} res
   */
  async getAllOrders(req, res) {
    try {
      const orders = await orderModel.getAllOrders();

      res.json({
        success: true,
        data: orders,
        count: orders.length
      });
    } catch (error) {
      console.error('Ошибка при получении всех заказов:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении заказов'
      });
    }
  }
}

module.exports = new OrdersController();
