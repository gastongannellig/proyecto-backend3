import Cart from '../models/carts.model.js';

export const getCartById = async (id) => {
  return await Cart.findById(id).populate('products.product');
};

export const createCart = async () => {
  const newCart = new Cart({ products: [] });
  return await newCart.save();
};

export const updateCart = async (id, updates) => {
  const cart = await Cart.findById(id);
  if (!cart) return null;
  Object.assign(cart, updates);
  return await cart.save();
};

export const deleteCartById = async (id) => {
  return await Cart.findByIdAndDelete(id);
};