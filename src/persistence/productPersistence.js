import Product from '../models/products.model.js';

export const getAllProducts = async (filter = {}, options = {}) => {
  return await Product.find(filter, null, options);
};

export const getProductById = async (id) => {
  return await Product.findById(id);
};

export const createProduct = async (productData) => {
  const newProduct = new Product(productData);
  return await newProduct.save();
};

export const updateProductById = async (id, updates) => {
  return await Product.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteProductById = async (id) => {
  return await Product.findByIdAndDelete(id);
};