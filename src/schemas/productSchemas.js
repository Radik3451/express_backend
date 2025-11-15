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
    .default('')
    .messages({
      'string.max': 'Описание не может превышать 500 символов'
    }),
  
  category_id: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .optional()
    .messages({
      'number.base': 'ID категории должен быть числом',
      'number.integer': 'ID категории должен быть целым числом',
      'number.positive': 'ID категории должен быть положительным числом'
    }),
  
  in_stock: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Поле in_stock должно быть булевым значением'
    })
}).strict(); // Строгая валидация - запрет неизвестных полей

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
  
  category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'ID категории должен быть числом',
      'number.integer': 'ID категории должен быть целым числом',
      'number.positive': 'ID категории должен быть положительным числом'
    }),
  
  in_stock: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Поле in_stock должно быть булевым значением'
    })
}).min(1).messages({
  'object.min': 'Необходимо передать хотя бы одно поле для обновления'
}).strict(); // Строгая валидация - запрет неизвестных полей

/**
 * Схема для создания категории
 */
const createCategorySchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Название категории не может быть пустым',
      'string.min': 'Название категории должно содержать минимум 1 символ',
      'string.max': 'Название категории не может превышать 50 символов',
      'any.required': 'Название категории обязательно'
    }),
  
  description: Joi.string()
    .max(200)
    .allow('')
    .default('')
    .messages({
      'string.max': 'Описание не может превышать 200 символов'
    })
}).strict(); // Строгая валидация - запрет неизвестных полей

/**
 * Схема для обновления категории (все поля опциональны)
 */
const updateCategorySchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.empty': 'Название категории не может быть пустым',
      'string.min': 'Название категории должно содержать минимум 1 символ',
      'string.max': 'Название категории не может превышать 50 символов'
    }),
  
  description: Joi.string()
    .max(200)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Описание не может превышать 200 символов'
    })
}).min(1).messages({
  'object.min': 'Необходимо передать хотя бы одно поле для обновления'
}).strict(); // Строгая валидация - запрет неизвестных полей

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
 * Схема для валидации query параметров фильтрации товаров
 */
const filterProductsSchema = Joi.object({
  category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'ID категории должен быть числом',
      'number.integer': 'ID категории должен быть целым числом',
      'number.positive': 'ID категории должен быть положительным числом'
    }),

  q: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Поисковый запрос не может превышать 100 символов'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Номер страницы должен быть числом',
      'number.integer': 'Номер страницы должен быть целым числом',
      'number.min': 'Номер страницы должен быть минимум 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Лимит должен быть числом',
      'number.integer': 'Лимит должен быть целым числом',
      'number.min': 'Лимит должен быть минимум 1',
      'number.max': 'Лимит не может превышать 100'
    })
});

/**
 * Схема для регистрации пользователя
 */
const registerUserSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.empty': 'Имя пользователя не может быть пустым',
      'string.min': 'Имя пользователя должно содержать минимум 3 символа',
      'string.max': 'Имя пользователя не может превышать 30 символов',
      'string.pattern.base': 'Имя пользователя может содержать только буквы, цифры и подчеркивания',
      'any.required': 'Имя пользователя обязательно'
    }),

  email: Joi.string()
    .email()
    .max(100)
    .required()
    .messages({
      'string.empty': 'Email не может быть пустым',
      'string.email': 'Некорректный формат email',
      'string.max': 'Email не может превышать 100 символов',
      'any.required': 'Email обязателен'
    }),

  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Пароль не может быть пустым',
      'string.min': 'Пароль должен содержать минимум 6 символов',
      'string.max': 'Пароль не может превышать 100 символов',
      'any.required': 'Пароль обязателен'
    })
}).strict();

/**
 * Схема для авторизации пользователя
 */
const loginUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email не может быть пустым',
      'string.email': 'Некорректный формат email',
      'any.required': 'Email обязателен'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Пароль не может быть пустым',
      'any.required': 'Пароль обязателен'
    })
}).strict();

/**
 * Схема для обновления профиля пользователя
 */
const updateProfileSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .optional()
    .messages({
      'string.empty': 'Имя пользователя не может быть пустым',
      'string.min': 'Имя пользователя должно содержать минимум 3 символа',
      'string.max': 'Имя пользователя не может превышать 30 символов',
      'string.pattern.base': 'Имя пользователя может содержать только буквы, цифры и подчеркивания'
    }),

  email: Joi.string()
    .email()
    .max(100)
    .optional()
    .messages({
      'string.empty': 'Email не может быть пустым',
      'string.email': 'Некорректный формат email',
      'string.max': 'Email не может превышать 100 символов'
    })
}).min(1).messages({
  'object.min': 'Необходимо передать хотя бы одно поле для обновления'
}).strict();

/**
 * Схема для обновления токенов
 */
const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Refresh токен не может быть пустым',
      'any.required': 'Refresh токен обязателен'
    })
}).strict();

/**
 * Схема для запроса на сброс пароля
 */
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email не может быть пустым',
      'string.email': 'Некорректный формат email',
      'any.required': 'Email обязателен'
    })
}).strict();

/**
 * Схема для сброса пароля
 */
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Токен не может быть пустым',
      'any.required': 'Токен обязателен'
    }),

  new_password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Новый пароль не может быть пустым',
      'string.min': 'Новый пароль должен содержать минимум 6 символов',
      'string.max': 'Новый пароль не может превышать 100 символов',
      'any.required': 'Новый пароль обязателен'
    })
}).strict();

/**
 * Схема для создания заказа
 */
const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'number.base': 'ID товара должен быть числом',
            'number.integer': 'ID товара должен быть целым числом',
            'number.positive': 'ID товара должен быть положительным числом',
            'any.required': 'ID товара обязателен'
          }),
        quantity: Joi.number()
          .integer()
          .min(1)
          .required()
          .messages({
            'number.base': 'Количество должно быть числом',
            'number.integer': 'Количество должно быть целым числом',
            'number.min': 'Количество должно быть минимум 1',
            'any.required': 'Количество обязательно'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Заказ должен содержать минимум 1 товар',
      'any.required': 'Список товаров обязателен'
    }),

  delivery_address: Joi.string()
    .max(500)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Адрес доставки не может превышать 500 символов'
    }),

  phone: Joi.string()
    .pattern(/^\+?[0-9\s\-()]{10,20}$/)
    .optional()
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Некорректный формат номера телефона'
    }),

  notes: Joi.string()
    .max(1000)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Примечания не могут превышать 1000 символов'
    })
}).strict();

/**
 * Схема для обновления заказа
 */
const updateOrderSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
    .optional()
    .messages({
      'any.only': 'Статус должен быть одним из: pending, processing, shipped, delivered, cancelled'
    }),

  delivery_address: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Адрес доставки не может превышать 500 символов'
    }),

  phone: Joi.string()
    .pattern(/^\+?[0-9\s\-()]{10,20}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат номера телефона'
    }),

  notes: Joi.string()
    .max(1000)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Примечания не могут превышать 1000 символов'
    })
}).min(1).messages({
  'object.min': 'Необходимо передать хотя бы одно поле для обновления'
}).strict();

module.exports = {
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
  filterProductsSchema,
  registerUserSchema,
  loginUserSchema,
  updateProfileSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createOrderSchema,
  updateOrderSchema
};