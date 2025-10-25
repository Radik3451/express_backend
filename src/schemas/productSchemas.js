const Joi = require('joi');

/**
 * Схема для создания товара
 */
const createProductSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Название товара не может быть пустым',
      'string.min': 'Название товара должно содержать минимум 1 символ',
      'string.max': 'Название товара не может превышать 100 символов',
      'any.required': 'Название товара обязательно'
    }),
  
  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Цена должна быть положительным числом',
      'number.base': 'Цена должна быть числом',
      'any.required': 'Цена обязательна'
    }),
  
  description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Описание не может превышать 500 символов'
    }),
  
  category: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Категория не может превышать 50 символов'
    }),
  
  inStock: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Поле inStock должно быть булевым значением'
    })
});

/**
 * Схема для обновления товара (все поля опциональны)
 */
const updateProductSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Название товара не может быть пустым',
      'string.min': 'Название товара должно содержать минимум 1 символ',
      'string.max': 'Название товара не может превышать 100 символов'
    }),
  
  price: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      'number.positive': 'Цена должна быть положительным числом',
      'number.base': 'Цена должна быть числом'
    }),
  
  description: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Описание не может превышать 500 символов'
    }),
  
  category: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Категория не может превышать 50 символов'
    }),
  
  inStock: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Поле inStock должно быть булевым значением'
    })
}).min(1).messages({
  'object.min': 'Необходимо передать хотя бы одно поле для обновления'
});

/**
 * Схема для валидации ID параметра
 */
const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID должен быть числом',
      'number.integer': 'ID должен быть целым числом',
      'number.positive': 'ID должен быть положительным числом',
      'any.required': 'ID обязателен'
    })
});

/**
 * Схема для валидации query параметров фильтрации
 */
const filterProductsSchema = Joi.object({
  category: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Категория не может превышать 50 символов'
    }),
  
  q: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Поисковый запрос не может превышать 100 символов'
    })
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
  filterProductsSchema
};
