const express = require('express');
const router = express.Router();
const productModel = require('../models/products');

// GET /api/stats - получить статистику по товарам
router.get('/', (req, res) => {
  try {
    const products = productModel.getAllProducts();
    
    const stats = {
      totalProducts: products.length,
      totalInStock: products.filter(p => p.inStock).length,
      totalOutOfStock: products.filter(p => !p.inStock).length,
      categories: [...new Set(products.map(p => p.category))],
      averagePrice: products.length > 0 
        ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2)
        : 0,
      priceRange: {
        min: products.length > 0 ? Math.min(...products.map(p => p.price)) : 0,
        max: products.length > 0 ? Math.max(...products.map(p => p.price)) : 0
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики'
    });
  }
});

module.exports = router;
