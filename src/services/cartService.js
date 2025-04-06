import cartRepository from '../repositories/cartRepository.js';

export const fetchCartById = async (id) => {
  return await cartRepository.getById(id);
};

export const createNewCart = async () => {
  return await cartRepository.create();
};

export const modifyCart = async (id, updates) => {
  return await cartRepository.updateById(id, updates);
};

export const removeCart = async (id) => {
  return await cartRepository.deleteById(id);
};

export const updateProductQuantityInCart = async (cartId, productId, quantity) => {
  return await cartRepository.updateProductQuantity(cartId, productId, quantity);
};

export const removeProductFromCart = async (cartId, productId) => {
  return await cartRepository.removeProduct(cartId, productId);
};