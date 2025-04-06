import productRepository from '../repositories/productRepository.js';

export const fetchProducts = async (filter, options) => {
  return await productRepository.getAll(filter, options);
};

export const fetchProductById = async (id) => {
  return await productRepository.getById(id);
};

export const addProduct = async (productData) => {
  return await productRepository.create(productData);
};

export const modifyProduct = async (id, updates) => {
  return await productRepository.updateById(id, updates);
};

export const removeProduct = async (id) => {
  return await productRepository.deleteById(id);
};

export const fetchCategories = async () => {
  return await productRepository.getDistinctCategories();
};