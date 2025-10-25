/**
 * @typedef {Object} Product
 * @property {number} id - Уникальный идентификатор товара
 * @property {string} name - Название товара
 * @property {number} price - Цена товара
 * @property {string} description - Описание товара
 * @property {string} category - Категория товара
 * @property {boolean} inStock - Наличие товара на складе
 */

/**
 * @typedef {Object} CreateProductData
 * @property {string} name - Название товара
 * @property {number} price - Цена товара
 * @property {string} [description] - Описание товара
 * @property {string} [category] - Категория товара
 * @property {boolean} [inStock] - Наличие товара на складе
 */

/**
 * @typedef {Object} UpdateProductData
 * @property {string} [name] - Название товара
 * @property {number} [price] - Цена товара
 * @property {string} [description] - Описание товара
 * @property {string} [category] - Категория товара
 * @property {boolean} [inStock] - Наличие товара на складе
 */

// Модель для работы с товарами
class ProductModel {
  constructor() {
    this.products = [
      {
        id: 1,
        name: 'iPhone 15',
        price: 999,
        description: 'Новейший смартфон от Apple',
        category: 'Электроника',
        inStock: true
      },
      {
        id: 2,
        name: 'MacBook Pro',
        price: 1999,
        description: 'Профессиональный ноутбук для работы',
        category: 'Электроника',
        inStock: true
      },
      {
        id: 3,
        name: 'Nike Air Max',
        price: 120,
        description: 'Удобные кроссовки для спорта',
        category: 'Обувь',
        inStock: false
      }
    ];
    
    // Переменная для генерации уникальных ID
    this.nextId = 4;
  }

  /**
   * Получить все товары
   * @returns {Product[]} Массив всех товаров
   */
  getAllProducts() {
    return this.products;
  }

  /**
   * Получить товар по ID
   * @param {number} id - ID товара
   * @returns {Product|null} Товар или null если не найден
   */
  getProductById(id) {
    return this.products.find(product => product.id === id);
  }

  /**
   * Создать новый товар
   * @param {CreateProductData} productData - Данные для создания товара
   * @returns {Product} Созданный товар
   */
  createProduct(productData) {
    const newProduct = {
      id: this.nextId++,
      name: productData.name,
      price: parseFloat(productData.price),
      description: productData.description || '',
      category: productData.category || 'Без категории',
      inStock: productData.inStock !== undefined ? Boolean(productData.inStock) : true
    };
    
    this.products.push(newProduct);
    return newProduct;
  }

  /**
   * Частично обновить товар (PATCH)
   * @param {number} id - ID товара
   * @param {UpdateProductData} productData - Данные для обновления
   * @returns {Product|null} Обновленный товар или null если не найден
   */
  updateProduct(id, productData) {
    const productIndex = this.products.findIndex(product => product.id === id);
    
    if (productIndex === -1) {
      return null;
    }
    
    // Обновляем только переданные поля
    const updatedProduct = { ...this.products[productIndex] };
    
    if (productData.name !== undefined) {
      updatedProduct.name = productData.name;
    }
    
    if (productData.price !== undefined) {
      updatedProduct.price = parseFloat(productData.price);
    }
    
    if (productData.description !== undefined) {
      updatedProduct.description = productData.description;
    }
    
    if (productData.category !== undefined) {
      updatedProduct.category = productData.category;
    }
    
    if (productData.inStock !== undefined) {
      updatedProduct.inStock = Boolean(productData.inStock);
    }
    
    this.products[productIndex] = updatedProduct;
    return updatedProduct;
  }

  /**
   * Удалить товар
   * @param {number} id - ID товара
   * @returns {Product|null} Удаленный товар или null если не найден
   */
  deleteProduct(id) {
    const productIndex = this.products.findIndex(product => product.id === id);
    
    if (productIndex === -1) {
      return null;
    }
    
    const deletedProduct = this.products[productIndex];
    this.products.splice(productIndex, 1);
    return deletedProduct;
  }

  /**
   * Получить товары по категории
   * @param {string} category - Категория товара
   * @returns {Product[]} Массив товаров в указанной категории
   */
  getProductsByCategory(category) {
    return this.products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Поиск товаров
   * @param {string} query - Поисковый запрос
   * @returns {Product[]} Массив найденных товаров
   */
  searchProducts(query) {
    return this.products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Проверить существование товара с таким именем
   * @param {string} name - Название товара
   * @param {number|null} excludeId - ID товара для исключения из поиска
   * @returns {Product|null} Товар с таким именем или null
   */
  findProductByName(name, excludeId = null) {
    return this.products.find(product => 
      product.name.toLowerCase() === name.toLowerCase() && 
      product.id !== excludeId
    );
  }

  /**
   * Получить количество товаров
   * @returns {number} Количество товаров
   */
  getProductsCount() {
    return this.products.length;
  }
}

module.exports = new ProductModel();
