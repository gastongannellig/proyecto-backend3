import Cart from '../models/carts.model.js';

class CartRepository {
  async getById(id) {
    return await Cart.findById(id).populate('products.product');
  }

  async create() {
    const newCart = new Cart({ products: [] });
    return await newCart.save();
  }

  async updateById(id, updates) {
    const cart = await Cart.findById(id);
    if (!cart) return null;
    Object.assign(cart, updates);
    return await cart.save();
  }

  async deleteById(id) {
    return await Cart.findByIdAndDelete(id);
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId).populate('products.product');
    if (!cart) return null;

    const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId);
    if (productIndex > -1) {
      cart.products[productIndex].quantity = quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    return await cart.save();
  }

  async removeProduct(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    cart.products = cart.products.filter(p => p.product.toString() !== productId);
    return await cart.save();
  }
}

export default new CartRepository();