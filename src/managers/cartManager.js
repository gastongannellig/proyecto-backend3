import fs from 'fs/promises';
import path from 'path';

const cartsFilePath = path.resolve('src/data/carts.json');
const productsFilePath = path.resolve('src/data/products.json');

class CartManager {
  // Crea un nuevo carrito
  async createCart() {
    try {
      const carts = await this.getCarts();
      const id = (Math.floor(Math.random() * 900) + 100).toString(); // Genera un ID único de hasta 3 cifras como string
      const newCart = { id, products: [] };
      carts.push(newCart);
      await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
      console.log(`Carrito creado (ID: ${newCart.id})`);
      return newCart;
    } catch (error) {
      console.error('Error al crear carrito:', error);
      throw error;
    }
  }

  // Obtiene todos los carritos
  async getCarts() {
    try {
      const data = await fs.readFile(cartsFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al obtener carritos:', error);
      throw error;
    }
  }

  // Obtiene un carrito por su ID
  async getCartById(id) {
    try {
      const carts = await this.getCarts();
      const cart = carts.find((c) => c.id === id);
      if (!cart) return null;

      // Obtener detalles de los productos
      const products = JSON.parse(await fs.readFile(productsFilePath, 'utf-8'));
      cart.products = cart.products.map((item) => {
        const product = products.find((p) => p.id === item.product);
        return { ...item, title: product.title };
      });

      return cart;
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      throw error;
    }
  }

  // Agrega un producto al carrito
  async addProductToCart(cartId, productId, quantity = 1) {
    try {
      const carts = await this.getCarts();
      const cart = carts.find((c) => c.id === cartId);
      if (!cart) return null;

      const productIndex = cart.products.findIndex(
        (p) => p.product === productId
      );
      if (productIndex === -1) {
        // Si el producto no existe en el carrito, lo agrega con la cantidad especificada
        cart.products.push({ product: productId, quantity });
      } else {
        // Si el producto ya existe en el carrito, incrementa la cantidad
        cart.products[productIndex].quantity += quantity;
      }

      await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
      console.log(
        `Producto agregado al carrito (Carrito ID: ${cartId}, Producto ID: ${productId}, Cantidad: ${quantity})`
      );
      return cart;
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      throw error;
    }
  }

  // Actualiza la cantidad de un producto en el carrito
  async updateProductQuantityInCart(cartId, productId, quantity) {
    try {
      const carts = await this.getCarts();
      const cart = carts.find((c) => c.id === cartId);
      if (!cart) return null;

      const productIndex = cart.products.findIndex(
        (p) => p.product === productId
      );
      if (productIndex === -1) {
        return null; // Producto no encontrado en el carrito
      }

      cart.products[productIndex].quantity = quantity; // Actualiza la cantidad

      await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
      console.log(
        `Cantidad de producto actualizada en el carrito (Carrito ID: ${cartId}, Producto ID: ${productId}, Nueva Cantidad: ${quantity})`
      );
      return cart;
    } catch (error) {
      console.error('Error al actualizar producto en el carrito:', error);
      throw error;
    }
  }

  // Elimina un producto del carrito
  async removeProductFromCart(cartId, productId) {
    try {
      const carts = await this.getCarts();
      const cart = carts.find((c) => c.id === cartId);
      if (!cart) return null;

      const newProducts = cart.products.filter((p) => p.product !== productId);
      if (newProducts.length === cart.products.length) {
        return null; // Producto no encontrado en el carrito
      }

      cart.products = newProducts;
      await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
      console.log(
        `Producto eliminado del carrito (Carrito ID: ${cartId}, Producto ID: ${productId})`
      );
      return cart;
    } catch (error) {
      console.error('Error al eliminar producto del carrito:', error);
      throw error;
    }
  }
}

export default CartManager;
