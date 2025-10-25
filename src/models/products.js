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

  // Получить все товары
  getAllProducts() {
    return this.products;
  }

  // Получить товар по ID
  getProductById(id) {
    return this.products.find(product => product.id === id);
  }

  // Создать новый товар
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

  // Частично обновить товар (PATCH)
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

  // Удалить товар
  deleteProduct(id) {
    const productIndex = this.products.findIndex(product => product.id === id);
    
    if (productIndex === -1) {
      return null;
    }
    
    const deletedProduct = this.products[productIndex];
    this.products.splice(productIndex, 1);
    return deletedProduct;
  }

  // Получить товары по категории
  getProductsByCategory(category) {
    return this.products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Поиск товаров
  searchProducts(query) {
    return this.products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Проверить существование товара с таким именем
  findProductByName(name, excludeId = null) {
    return this.products.find(product => 
      product.name.toLowerCase() === name.toLowerCase() && 
      product.id !== excludeId
    );
  }

  // Получить количество товаров
  getProductsCount() {
    return this.products.length;
  }
}

module.exports = new ProductModel();
