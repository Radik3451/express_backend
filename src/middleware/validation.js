const Joi = require('joi');

/**
 * Универсальный middleware для валидации данных
 * @param {Joi.ObjectSchema} schema - Joi схема для валидации
 * @param {string} source - Источник данных ('body', 'params', 'query')
 * @returns {Function} Express middleware функция
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    
    const { error, value } = schema.validate(data, {
      abortEarly: false, // Показывать все ошибки, а не только первую
      stripUnknown: true, // Удалять неизвестные поля
      convert: true // Автоматически конвертировать типы
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors: errorDetails
      });
    }

    // Заменяем данные на валидированные и очищенные
    req[source] = value;
    next();
  };
};

/**
 * Middleware для валидации данных создания товара
 */
const validateCreateProduct = validate(
  require('../schemas/productSchemas').createProductSchema,
  'body'
);

/**
 * Middleware для валидации данных обновления товара
 */
const validateUpdateProduct = validate(
  require('../schemas/productSchemas').updateProductSchema,
  'body'
);

/**
 * Middleware для валидации ID параметра
 */
const validateIdParam = validate(
  require('../schemas/productSchemas').idParamSchema,
  'params'
);

/**
 * Middleware для валидации query параметров фильтрации
 */
const validateFilterProducts = validate(
  require('../schemas/productSchemas').filterProductsSchema,
  'query'
);

module.exports = {
  validate,
  validateCreateProduct,
  validateUpdateProduct,
  validateIdParam,
  validateFilterProducts
};
