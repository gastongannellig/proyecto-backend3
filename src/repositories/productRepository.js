import Product from '../models/products.model.js';

class ProductRepository {
  async getAll(filter = {}, options = {}) {
    return await Product.find(filter, null, options);
  }

  async getById(id) {
    return await Product.findById(id);
  }

  async create(productData) {
    const newProduct = new Product(productData);
    return await newProduct.save();
  }

  async updateById(id, updates) {
    return await Product.findByIdAndUpdate(id, updates, { new: true });
  }

  async deleteById(id) {
    return await Product.findByIdAndDelete(id);
  }

  async getDistinctCategories() {
    return await Product.distinct('category');
  }
}

export default new ProductRepository();