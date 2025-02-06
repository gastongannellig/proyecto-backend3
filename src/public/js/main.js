document.addEventListener("DOMContentLoaded", async () => {
  const currentPath = window.location.pathname;

  // Función para cargar categorías de productos
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/products/categories');
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.payload)) {
        const categories = data.payload;
        const categoryDropdown = document.getElementById('category-dropdown');
        categoryDropdown.innerHTML = '';
        categories.forEach(category => {
          const categoryLink = document.createElement('a');
          categoryLink.href = `/realtimeproducts?category=${category}`;
          categoryLink.textContent = category;
          categoryDropdown.appendChild(categoryLink);
        });
      } else {
        throw new Error(`La respuesta de la API no contiene un array de categorías. Recibido: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  // Función para actualizar el contador del carrito
  const updateCartCount = async () => {
    const cartId = localStorage.getItem('cartId') || 'default-cart-id';
    try {
      const response = await fetch(`/api/carts/${cartId}`);
      if (response.ok) {
        const cart = await response.json();
        const count = cart.products.reduce((total, product) => total + product.quantity, 0);
        const cartCount = document.getElementById('cart-count');
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'block' : 'none';
      } else {
        console.error("Error al obtener el carrito");
      }
    } catch (error) {
      console.error("Error al obtener el carrito:", error);
    }
  };

  // Cargar categorías de productos en todas las rutas
  loadCategories();

  const socket = io(); // Inicializar el cliente de Socket.IO
  const cartId = localStorage.getItem('cartId') || 'default-cart-id'; // Utilizar un único ID de carrito

  // Crear un carrito si no existe
  try {
    const response = await fetch(`/api/carts/${cartId}`);
    if (!response.ok) {
      const newCartResponse = await fetch('/api/carts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: cartId })
      });
      const newCart = await newCartResponse.json();
      localStorage.setItem('cartId', newCart._id);
    }
  } catch (error) {
    console.error('Error al crear carrito:', error);
  }

  const loadProducts = async (category = '', page = 1) => {
    try {
      const response = await fetch(`/api/products?limit=4&page=${page}${category ? `&query=${category}` : ''}`);
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.payload)) {
        const products = data.payload;
        const productList = document.getElementById("product-list");
        if (productList) {
          productList.innerHTML = products.map(product => {
            const thumbnails = Array.isArray(product.thumbnails) ? product.thumbnails : [];
            return `
              <div class="product-card">
                <button class="delete-product admin-only" data-id="${product._id}">x</button>
                <h3 class="product-title">${product.title}</h3>
                <p>${product.description}</p>
                <p>Precio: $${product.price}</p>
                <p>Stock: ${product.stock}</p>
                ${thumbnails.length ? `
                  <div class="product-thumbnails">
                    ${thumbnails.map(thumbnail => `<img src="${thumbnail}" alt="Product Thumbnail" class="product-thumbnail">`).join('')}
                  </div>
                ` : ''}
                <button class="add-to-cart" data-id="${product._id}" data-stock="${product.stock}">Agregar al Carrito</button>
              </div>
            `;
          }).join('');

          // Aplicar lógica de administrador y usuario
          const userRole = localStorage.getItem('userRole');
          if (userRole === 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
          } else {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
          }

          // Reasignar eventos a los nuevos botones
          document.querySelectorAll(".delete-product").forEach(button => {
            button.addEventListener("click", async (event) => {
              const productId = event.target.getAttribute("data-id");
              if (await Swal.fire({
                title: '¿Estás seguro?',
                text: "Tu producto se eliminará!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, bórralo!'
              }).then((result) => result.isConfirmed)) {
                try {
                  const response = await fetch(`/api/products/${productId}`, {
                    method: "DELETE"
                  });
                  if (response.ok) {
                    // Emitir evento de eliminación de producto
                    socket.emit('productDeleted', productId);
                    Swal.fire(
                      'Eliminado!',
                      'El producto ha sido eliminado.',
                      'success'
                    );
                  } else {
                    Swal.fire('Error', 'Error al eliminar producto del catálogo', 'error');
                  }
                } catch (error) {
                  Swal.fire('Error', `Error al eliminar producto del catálogo: ${error}`, 'error');
                }
              }
            });
          });

          document.querySelectorAll(".add-to-cart").forEach(button => {
            button.addEventListener("click", async (event) => {
              const productId = event.target.getAttribute("data-id");
              const productStock = parseInt(event.target.getAttribute("data-stock"));
              const productTitle = event.target.closest('.product-card').querySelector('.product-title').textContent;

              try {
                const response = await fetch(`/api/carts/${cartId}`);
                if (!response.ok) {
                  throw new Error('Error al obtener el carrito');
                }
                const cart = await response.json();
                if (!cart || !cart.products) {
                  throw new Error('Carrito no encontrado o sin productos');
                }
                const productInCart = cart.products.find(p => p.product && p.product._id === productId);
                const quantityInCart = productInCart ? productInCart.quantity : 0;

                if (quantityInCart < productStock) {
                  const addResponse = await fetch(`/api/carts/${cartId}/products`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ productId, quantity: 1 })
                  });
                  if (addResponse.ok) {
                    toastr.success(`Producto <strong>${productTitle}</strong> agregado al carrito`, { positionClass: 'toast-top-right' });
                    // Emitir evento de adición de producto al carrito
                    socket.emit('productAddedToCart', { productId, quantity: 1 });
                  } else {
                    toastr.error(`Se ha producido un error al agregar <strong>${productTitle}</strong> al carrito.`, { positionClass: 'toast-top-right' });
                  }
                } else {
                  toastr.warning('No hay suficiente stock disponible para agregar más de este producto al carrito.', 'Stock insuficiente', { positionClass: 'toast-top-right' });
                }
              } catch (error) {
                toastr.error(`Error al agregar producto al carrito: ${error.message}`, 'Error', { positionClass: 'toast-top-right' });
              }
            });
          });

          // Actualizar controles de paginación
          const paginationControls = document.getElementById('pagination-controls');
          if (paginationControls) {
            paginationControls.innerHTML = `
              ${data.hasPrevPage ? `<a href="#" class="pagination-button" data-page="${data.prevPage}">«</a>` : ''}
              <span id="page-info">Página ${data.currentPage} de ${data.totalPages}</span>
              ${data.hasNextPage ? `<a href="#" class="pagination-button" data-page="${data.nextPage}">»</a>` : ''}
            `;

            // Asignar eventos a los botones de paginación
            document.querySelectorAll('.pagination-button').forEach(button => {
              button.addEventListener('click', (event) => {
                event.preventDefault();
                const page = event.target.getAttribute('data-page');
                loadProducts(category, page);
              });
            });
          }
        }
      } else {
        throw new Error(`La respuesta de la API no contiene un array de productos. Recibido: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      Swal.fire('Error', `Error al cargar productos: ${error}`, 'error');
    }
  };

  const updateCart = (cart) => {
    const cartList = document.getElementById("cart-list");
    if (cartList) {
      if (cart.products.length) {
        cartList.innerHTML = cart.products
          .filter(product => product.product) // Filtrar productos nulos
          .map(product => `
            <div class="product-card">
              <button class="remove-product-cart" data-id="${product.product._id}">x</button>
              <h3>${product.product.title}</h3>
              <div class="quantity-control">
                <button class="decrease-quantity" data-id="${product.product._id}">-</button>
                <span class="quantity">${product.quantity}</span>
                <button class="increase-quantity" data-id="${product.product._id}" data-stock="${product.product.stock}">+</button>
              </div>
            </div>
          `).join('');
        cartList.innerHTML += '<button id="empty-cart" class="empty-cart"><i class="fas fa-trash-alt"></i></button>';
      } else {
        cartList.innerHTML = '<p>Carrito vacío</p>';
      }

      // Actualizar el contador del carrito
      updateCartCount(cart);

      // Reasignar eventos a los nuevos botones
      document.querySelectorAll(".remove-product-cart").forEach(button => {
        button.addEventListener("click", async (event) => {
          const productId = event.target.getAttribute("data-id");
          try {
            const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
              method: "DELETE"
            });
            if (response.ok) {
              socket.emit('productRemovedFromCart', { cartId, productId });
            } else {
              console.error("Error al eliminar el producto del carrito");
            }
          } catch (error) {
            console.error("Error al eliminar el producto del carrito:", error);
          }
        });
      });

      document.querySelectorAll(".increase-quantity").forEach(button => {
        button.addEventListener("click", (event) => {
          const productId = event.target.getAttribute("data-id");
          const stock = parseInt(event.target.getAttribute("data-stock"));
          const quantityElement = event.target.previousElementSibling;
          let quantity = parseInt(quantityElement.textContent);

          if (quantity < stock) {
            updateProductQuantity(productId, quantity + 1);
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'Stock insuficiente',
              text: 'No hay suficiente stock disponible para agregar más de este producto al carrito.',
            });
          }
        });
      });

      document.querySelectorAll(".decrease-quantity").forEach(button => {
        button.addEventListener("click", (event) => {
          const productId = event.target.getAttribute("data-id");
          const quantityElement = event.target.nextElementSibling;
          let quantity = parseInt(quantityElement.textContent);

          if (quantity > 1) {
            updateProductQuantity(productId, quantity - 1);
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'Cantidad mínima',
              text: 'La cantidad mínima de productos es 1.',
            });
          }
        });
      });

      document.getElementById("empty-cart").addEventListener("click", (event) => {
        event.preventDefault();
        Swal.fire({
          title: '¿Estás seguro?',
          text: "Todo tu carrito se perderá!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, vaciar carrito!'
        }).then((result) => {
          if (result.isConfirmed) {
            emptyCart();
          }
        });
      });
    }
  };

  const updateProductQuantity = async (productId, quantity) => {
    try {
      const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ quantity })
      });
      if (response.ok) {
        const updatedCart = await response.json();
        socket.emit('productQuantityUpdated', { cartId, productId, quantity });
        updateCart(updatedCart);
      } else {
        console.error("Error al actualizar cantidad de producto en el carrito");
      }
    } catch (error) {
      console.error("Error al actualizar cantidad de producto en el carrito:", error);
    }
  };

  const emptyCart = async () => {
    try {
      const response = await fetch(`/api/carts/${cartId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        const updatedCart = await response.json();
        socket.emit('cartEmptied', cartId);
        updateCart(updatedCart);
      } else {
        console.error("Error al vaciar el carrito");
      }
    } catch (error) {
      console.error("Error al vaciar el carrito:", error);
    }
  };

  // Escuchar eventos de WebSockets para actualizar productos en tiempo real
  socket.on("updateProducts", (newProduct) => {
    console.log("Nuevo producto recibido:", newProduct);
    loadProducts(); // Recargar la lista de productos
  });

  socket.on("productDeleted", async (productId) => {
    console.log("Producto eliminado:", productId);
    loadProducts(); // Recargar la lista de productos

    // Eliminar el producto del carrito si existe
    try {
      const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        const updatedCart = await response.json();
        socket.emit('updateCart', updatedCart);
      } else {
        console.error("Error al eliminar el producto del carrito");
      }
    } catch (error) {
      console.error("Error al eliminar el producto del carrito:", error);
    }
  });

  socket.on("productAddedToCart", async (data) => {
    console.log("Producto agregado al carrito:", data);
    try {
      const response = await fetch(`/api/carts/${cartId}`);
      if (response.ok) {
        const cart = await response.json();
        updateCart(cart);
      } else {
        console.error("Error al obtener el carrito");
      }
    } catch (error) {
      console.error("Error al obtener el carrito:", error);
    }
  });

  socket.on("productRemovedFromCart", async (data) => {
    console.log("Producto eliminado del carrito:", data);
    try {
      const response = await fetch(`/api/carts/${cartId}`);
      if (response.ok) {
        const cart = await response.json();
        updateCart(cart);
      } else {
        console.error("Error al obtener el carrito");
      }
    } catch (error) {
      console.error("Error al obtener el carrito:", error);
    }
  });

  socket.on("productQuantityUpdated", async (data) => {
    console.log("Cantidad de producto actualizada en el carrito:", data);
    try {
      const response = await fetch(`/api/carts/${cartId}`);
      if (response.ok) {
        const cart = await response.json();
        updateCart(cart);
      } else {
        console.error("Error al obtener el carrito");
      }
    } catch (error) {
      console.error("Error al obtener el carrito:", error);
    }
  });

  socket.on("cartEmptied", async (cartId) => {
    console.log("Carrito vaciado:", cartId);
    try {
      const response = await fetch(`/api/carts/${cartId}`);
      if (response.ok) {
        const cart = await response.json();
        updateCart(cart);
      } else {
        console.error("Error al obtener el carrito");
      }
    } catch (error) {
      console.error("Error al obtener el carrito:", error);
    }
  });

  // Inicializar el carrito
  try {
    const response = await fetch(`/api/carts/${cartId}`);
    if (response.ok) {
      const cart = await response.json();
      updateCart(cart);
    } else {
      console.error("Error al obtener el carrito");
    }
  } catch (error) {
    console.error("Error al obtener el carrito:", error);
  }

  // Cargar productos si estamos en la página de productos en tiempo real
  if (currentPath === '/realtimeproducts') {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const page = urlParams.get('page') || 1;
    loadProducts(category, page);
  }
});