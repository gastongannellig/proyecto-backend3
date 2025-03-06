import notifications from './notifications.js';

document.addEventListener("DOMContentLoaded", async () => {
  const socket = io();

  // Utilidades
  const getCurrentUser = async () => {
    try {
      const response = await fetch('/api/sessions/current', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 401) {
        return null;
      }
      
      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Error getting current user');
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  };

  // Funciones del carrito
  const updateCartCount = async (cartId) => {
    try {
      const response = await fetch(`/api/carts/${cartId}`);
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
  };

  const removeProductFromCart = async (productId) => {
    try {
      const user = await getCurrentUser();
      if (!user || !user.cart) return;

      const response = await fetch(`/api/carts/${user.cart}/products/${productId}`, {
        method: "DELETE",
        credentials: 'include'
      });

      if (response.ok) {
        
        const productElement = document.querySelector(`button[data-id="${productId}"]`).closest('.product-card');
        productElement.remove();
        
        
        updateCartCount(user.cart);
        
        notifications.success('Producto eliminado del carrito');
      } else {
        notifications.error('Error al eliminar producto');
      }
    } catch (error) {
      console.error('Error:', error);
      notifications.error('Error al eliminar producto');
    }
  };

  const updateProductQuantity = async (productId, quantity) => {
    try {
      const user = await getCurrentUser();
      if (!user || !user.cart) return;

      const response = await fetch(`/api/carts/${user.cart}/products/${productId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json" 
        },
        credentials: 'include',
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        // Actualizar la UI inmediatamente sin recargar la página
        const quantityElement = document.querySelector(`button[data-id="${productId}"]`)
          .parentElement.querySelector('.quantity');
        quantityElement.textContent = quantity;
        
        // Actualizar el contador del carrito
        updateCartCount(user.cart);
        
        notifications.success('Cantidad actualizada');
      } else {
        notifications.error('Error al actualizar cantidad');
      }
    } catch (error) {
      console.error('Error:', error);
      notifications.error('Error al actualizar cantidad');
    }
  };

  const handleQuantityChange = async (event) => {
    try {
      const button = event.target;
      const productId = button.getAttribute('data-id');
      const isIncrease = button.classList.contains('increase-quantity');
      const stock = parseInt(button.getAttribute('data-stock')) || 0;
      
      const quantityElement = button.parentElement.querySelector('.quantity');
      let currentQuantity = parseInt(quantityElement.textContent);
      
      if (isIncrease) {
        if (currentQuantity >= stock) {
          notifications.error(`No hay suficiente stock. Stock disponible: ${stock}`);
          return;
        }
        currentQuantity++;
      } else {
        if (currentQuantity <= 1) {
          await removeProductFromCart(productId);
          return;
        }
        currentQuantity--;
      }
      
      await updateProductQuantity(productId, currentQuantity);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      notifications.error('Error al actualizar cantidad');
    }
  };

  const addProductToCart = async (productId, productTitle, stock) => {
    try {
      const user = await getCurrentUser();
      if (!user || !user.cart) {
        await notifications.showLoginAlert();
        return;
      }

      // Verificar stock antes de agregar
      const cartResponse = await fetch(`/api/carts/${user.cart}`, {
        credentials: 'include'
      });
      
      if (!cartResponse.ok) {
        if (cartResponse.status === 401) {
          await notifications.showLoginAlert();
          return;
        }
        throw new Error('Error al obtener el carrito');
      }

      const cart = await cartResponse.json();
      const productInCart = cart.products.find(p => p.product._id === productId);
      const currentQuantity = productInCart ? productInCart.quantity : 0;

      if (currentQuantity >= stock) {
        notifications.error(`No hay suficiente stock. Stock disponible: ${stock}`);
        return;
      }

      const response = await fetch(`/api/carts/${user.cart}/products`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity: 1 })
      });

      if (response.ok) {
        notifications.success(`Producto ${productTitle} agregado al carrito`);
        updateCartCount(user.cart);
      } else {
        const errorData = await response.json();
        if (errorData.showLoginAlert) {
          await notifications.showLoginAlert();
        } else {
          notifications.error(errorData.error || 'Error al agregar producto al carrito');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      notifications.error('Error al agregar producto al carrito');
    }
  };

  const emptyCart = async () => {
    try {
      const user = await getCurrentUser();
      if (!user || !user.cart) return;
      
      const result = await notifications.showAlert({
        title: '¿Estás seguro?',
        text: 'Esta acción vaciará todo tu carrito',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar carrito',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      });
      
      if (result.isConfirmed) {
        const response = await fetch(`/api/carts/${user.cart}`, {
          method: "DELETE",
          credentials: 'include'
        });

        if (response.ok) {
          
          const cartList = document.getElementById('cart-list');
          if (cartList) {
            cartList.innerHTML = '<p>Tu carrito está vacío</p>';
          }
          
        
          updateCartCount(user.cart);
          
          notifications.success('Carrito vaciado');
        } else {
          notifications.error('Error al vaciar el carrito');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      notifications.error('Error al vaciar el carrito');
    }
  };

  const initializeAddToCartButtons = () => {
    document.querySelectorAll(".add-to-cart").forEach(button => {
      button.addEventListener("click", async (event) => {
        const productId = event.target.getAttribute("data-id");
        const stock = parseInt(event.target.getAttribute("data-stock"));
        const productTitle = event.target.closest('.product-card').querySelector('h3').textContent;
        await addProductToCart(productId, productTitle, stock);
      });
    });
  };

  // Event Listeners
  const initializeCartEventListeners = () => {
    // Eliminar producto del carrito
    document.querySelectorAll(".remove-product-cart").forEach(button => {
      button.addEventListener("click", async (event) => {
        const productId = event.target.getAttribute("data-id");
        await removeProductFromCart(productId);
      });
    });

    // Controles de cantidad
    document.querySelectorAll(".decrease-quantity, .increase-quantity").forEach(button => {
      button.addEventListener("click", handleQuantityChange);
    });

    // Vaciar carrito
    const emptyCartButton = document.getElementById("empty-cart");
    if (emptyCartButton) {
      emptyCartButton.addEventListener("click", emptyCart);
    }
  };

  const initializeAllEventListeners = async () => {
    const user = await getCurrentUser();
    if (user && user.cart) {
      const cartLink = document.getElementById('cart-link');
      if (cartLink) {
        cartLink.href = `/carts/${user.cart}`;
      }
      updateCartCount(user.cart);
      
      // Solo inicializar los event listeners del carrito si estamos en la página del carrito
      if (window.location.pathname.includes('/carts/')) {
        initializeCartEventListeners();
      }
    }
    
    // Siempre inicializar los botones de agregar al carrito
    initializeAddToCartButtons();
  };

  await initializeAllEventListeners();

  // Sockets
  socket.on("productAddedToCart", () => {
    const user = getCurrentUser();
    if (user && user.cart) updateCartCount(user.cart);
  });
});

// Funciones de manejo de sesión
const handleLogin = async (userData) => {
  if (userData.user && userData.user.role) {
    localStorage.setItem('userRole', userData.user.role);
  }
  // Recargar la página para reflejar los cambios en el menú y el carrito
  location.reload();
};

const handleLogout = async () => {
  try {
    const response = await fetch('/api/sessions/logout', {
      method: 'POST',
      credentials: 'include' // Para enviar las cookies de sesión
    });

    if (response.ok) {
      localStorage.removeItem('userRole');
      localStorage.removeItem('cartId');
  

      window.location.href = '/';
    } else {
      notifications.error('Error al cerrar sesión');
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    notifications.error('Error al cerrar sesión');
  }
};

// Asegurarse de llamar a esta función cuando se carga la página
document.addEventListener("DOMContentLoaded", async () => {
  const user = await getCurrentUser();
  if (user && user.cart) {
    initializeCartEventListeners();
  }
});