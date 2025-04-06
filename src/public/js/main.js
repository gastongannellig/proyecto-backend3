import { initializeCartEventListeners } from './cartUtils.js';
import notifications from './notifications.js';
import { getCurrentUser } from './layout.js';

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
        const response = await fetch(`/api/carts/${cartId}`, {
            credentials: 'include'
        });
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

  async function removeProductFromCart(productId) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.cart) {
            throw new Error('No se encontró el carrito del usuario');
        }

        // Realizar la solicitud DELETE al servidor con la ruta correcta
        const response = await fetch(`/api/carts/${user.cart}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el producto');
        }

        // Encontrar y eliminar el elemento del DOM
        const productElement = document.querySelector(`.cart-product-card button[data-id="${productId}"]`)?.closest('.cart-product-card');
        
        if (productElement) {
            productElement.remove();

            // Actualizar el contador y el total del carrito
            await updateCartCount(user.cart);
            await updateCartTotal();

            // Mostrar notificación de éxito
            notifications.success('Producto eliminado del carrito');

            // Verificar si el carrito está vacío
            const remainingProducts = document.querySelectorAll('.cart-product-card');
            if (remainingProducts.length === 0) {
                const cartProducts = document.querySelector('.cart-products');
                if (cartProducts) {
                    cartProducts.innerHTML = '<p>Tu carrito está vacío</p>';
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
        notifications.error('Error al eliminar el producto del carrito');
    }
  }

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
      const productId = button.getAttribute("data-id");
      const isIncrease = button.classList.contains("increase-quantity");
      const stock = parseInt(button.getAttribute("data-stock")) || 0;

      const quantityElement = button.parentElement.querySelector(".quantity");
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

      // Actualizar el total y el ticket después de cambiar la cantidad
      updateCartTotal();
      updatePurchaseSummary();
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
      notifications.error("Error al actualizar cantidad");
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

  socket.on("cartUpdated", async ({ cartId }) => {
    const user = await getCurrentUser();
    if (user && user.cart === cartId) {
      updateCartTotal();
      updatePurchaseSummary();
    }
  });

  const createProductForm = document.getElementById('create-product-form');
  if (createProductForm) {
    createProductForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        code: document.getElementById('code').value || generateRandomCode(), // Generar código si está vacío
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value),
        category: document.getElementById('category').value,
        thumbnails: document.getElementById('thumbnails').value.split(',').map(url => url.trim()).filter(url => url)
      };

      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const newProduct = await response.json();
          notifications.success('Producto creado exitosamente');
          
          // Emitir evento de Socket.IO para actualizar productos en tiempo real
          socket.emit('updateProducts', newProduct);
          
          // Limpiar el formulario
          createProductForm.reset();
          
          // Recargar la página después de un breve delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          const error = await response.json();
          notifications.error(error.error || 'Error al crear el producto');
        }
      } catch (error) {
        console.error('Error:', error);
        notifications.error('Error al crear el producto');
      }
    });
  }
});

// Función para generar código aleatorio
function generateRandomCode() {
  const prefix = 'PROD';
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${randomNum}-${timestamp}`;
}

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

document.addEventListener("DOMContentLoaded", async () => {
  const user = await getCurrentUser();
  if (user && user.cart) {
    initializeCartEventListeners(); // Ahora la función está disponible
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const finalizePurchaseButton = document.getElementById("finalize-purchase");
  const preCheckoutModal = document.getElementById("pre-checkout-modal");

  if (finalizePurchaseButton) {
    finalizePurchaseButton.addEventListener("click", () => {
      // Abrir directamente el modal de pre-checkout
      preCheckoutModal.style.display = "flex";
    });
  }

  // Cerrar modal
  const closeModalButtons = document.querySelectorAll(".close-modal");
  closeModalButtons.forEach(button => {
    button.addEventListener("click", () => {
      button.closest('.modal').style.display = "none";
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const confirmPurchaseButton = document.getElementById("confirm-purchase");
  const preCheckoutModal = document.getElementById("pre-checkout-modal");
  const purchaseModal = document.getElementById("purchase-modal");
  const ticketModal = document.getElementById("ticket-modal");
  const preCheckoutForm = document.getElementById("pre-checkout-form");

  if (confirmPurchaseButton) {
    confirmPurchaseButton.addEventListener("click", () => {
      // Cerrar el modal de resumen de compra y abrir el pre-checkout
      purchaseModal.style.display = "none";
      preCheckoutModal.style.display = "flex";
    });
  }

  if (preCheckoutForm) {
    preCheckoutForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Obtener los datos del formulario
      const fullName = document.getElementById("full-name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;

      try {
        const user = await getCurrentUser();
        if (!user || !user.cart) {
          alert("No se encontró el carrito del usuario.");
          return;
        }

        // Enviar la solicitud al servidor para generar el ticket
        const response = await fetch(`/api/carts/${user.cart}/purchase`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fullName, email, phone }),
        });

        if (response.ok) {
          const data = await response.json();

          if (data.ticket && data.ticket.details && data.ticket.details.products) {
            // Mostrar el ticket en el modal
            document.getElementById("ticket-full-name").textContent = fullName;
            document.getElementById("ticket-email").textContent = email;
            document.getElementById("ticket-phone").textContent = phone;

            const ticketProducts = document.getElementById("ticket-products");
            ticketProducts.innerHTML = ""; // Limpiar contenido previo
            data.ticket.details.products.forEach((product) => {
              const row = document.createElement("tr");
              row.innerHTML = `
                <td>${product.title}</td>
                <td>${product.quantity}</td>
                <td>$${Number(product.price).toFixed(2)}</td>
              `;
              ticketProducts.appendChild(row);
            });

            document.getElementById("ticket-total").textContent = Number(data.ticket.amount).toFixed(2);

            // Cerrar el pre-checkout y abrir el modal del ticket
            preCheckoutModal.style.display = "none";
            ticketModal.style.display = "flex";

            // Vaciar el carrito en tiempo real
            const cartList = document.getElementById("cart-list");
            if (cartList) {
              cartList.innerHTML = "<p>Tu carrito está vacío</p>";
            }

            // Emitir evento de Socket.IO para actualizar el carrito
            const socket = io();
            socket.emit("updateCart", { cartId: user.cart });
          } else {
            alert("Error: No se pudo generar el ticket correctamente.");
          }
        } else {
          const error = await response.json();
          alert(`Error al finalizar la compra: ${error.error}`);
        }
      } catch (error) {
        console.error("Error al finalizar la compra:", error);
        alert("Error al finalizar la compra.");
      }
    });
  }

  // Cerrar el modal del ticket
  const closeModalButton = document.querySelector("#ticket-modal .close-modal");
  if (closeModalButton) {
    closeModalButton.addEventListener("click", () => {
      ticketModal.style.display = "none";
    });
  }
});

const updateCartTotal = async () => {
    try {
        const user = await getCurrentUser();
        if (!user || !user.cart) return;

        const response = await fetch(`/api/carts/${user.cart}`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Error al obtener el carrito');

        const cart = await response.json();
        let total = 0;

        cart.products.forEach(item => {
            total += item.quantity * Number(item.product.price);
        });

        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
            totalElement.textContent = `$${Number(total).toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error al actualizar el total del carrito:', error);
    }
};

const updatePurchaseSummary = async () => {
  try {
    const user = await getCurrentUser();
    if (!user || !user.cart) return;

    const response = await fetch(`/api/carts/${user.cart}`);
    if (!response.ok) throw new Error("Error al obtener el carrito");

    const cart = await response.json();
    const productsSummaryList = document.querySelector(".products-summary ul");
    const totalElement = document.getElementById("modal-total");

    let total = 0;
    productsSummaryList.innerHTML = ""; // Limpiar el contenido actual

    cart.products.forEach(item => {
      const subtotal = item.quantity * item.product.price;
      total += subtotal;

      // Agregar producto al resumen
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <span>${item.product.title}</span>
        <span>x${item.quantity}</span>
        <span>$${subtotal.toFixed(2)}</span>
      `;
      productsSummaryList.appendChild(listItem);
    });

    // Actualizar el total en el modal
    if (totalElement) {
      totalElement.textContent = `$${total.toFixed(2)}`;
    }
  } catch (error) {
    console.error("Error al actualizar el resumen de compra:", error);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  updateCartTotal();
  updatePurchaseSummary();
});

document.addEventListener('DOMContentLoaded', () => {
    const removeButtons = document.querySelectorAll('.remove-product-cart');
    removeButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const productId = event.target.getAttribute('data-id');
            if (productId) {
                await removeProductFromCart(productId);
            }
        });
    });
});