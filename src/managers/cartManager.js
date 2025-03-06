import notifications from './notifications.js';

class CartManager {
  constructor(cartId) {
    this.cartId = cartId;
  }

  async updateCartCount() {
    try {
      const response = await fetch(`/api/carts/${this.cartId}`);
      if (response.ok) {
        const cart = await response.json();
        const count = cart.products.reduce((total, product) => total + product.quantity, 0);
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
          cartCount.textContent = count;
          cartCount.style.display = count > 0 ? 'block' : 'none';
        }
      }
    } catch (error) {
      console.error('Error al actualizar contador del carrito:', error);
    }
  }

  async addProduct(productId, productTitle, quantity = 1) {
    try {
      const response = await fetch(`/api/carts/${this.cartId}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId, quantity })
      });

      if (response.ok) {
        notifications.success(`Producto <strong>${productTitle}</strong> agregado al carrito`);
        await this.updateCartCount();
        document.dispatchEvent(new CustomEvent('productAddedToCart'));
      } else {
        const errorData = await response.json();
        if (errorData.showLoginAlert) {
          await notifications.showLoginAlert();
        } else {
          notifications.error(errorData.error || 'Error al agregar producto al carrito');
        }
      }
    } catch (error) {
      notifications.error('Error al agregar producto al carrito');
    }
  }
}

export default CartManager;