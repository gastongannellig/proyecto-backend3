document.addEventListener("DOMContentLoaded", async () => {
  const currentPath = window.location.pathname;

  if (currentPath === '/realtimeproducts') {
    const productList = document.getElementById("product-list");
    if (!productList) {
      console.error("Elemento con ID 'product-list' no encontrado.");
      return; // Salir si no estamos en la página de productos en tiempo real
    }

    const socket = io();
    const cartId = 'default-cart-id'; // Utilizar un único ID de carrito

    // Crear un carrito si no existe
    try {
      const response = await fetch(`/api/carts/${cartId}`);
      if (!response.ok) {
        await fetch('/api/carts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: cartId })
        });
      }
    } catch (error) {
      console.error('Error al crear carrito:', error);
    }

    socket.on("updateProducts", (products) => {
      productList.innerHTML = "";
      products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.className = "product-card";
        productCard.innerHTML = `
          <h2>${product.title}</h2>
          <p>Precio: $${product.price}</p>
          <p>Stock: ${product.stock}</p>
          <button class="add-to-cart" data-id="${product.id}" data-stock="${product.stock}">Agregar al Carrito</button>
          <button class="remove-product" data-id="${product.id}">Eliminar Producto</button>`;
        productList.appendChild(productCard);
      });

      // Agregar eventos a los botones
      document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", async (event) => {
          const productId = event.target.getAttribute("data-id");
          const productStock = parseInt(event.target.getAttribute("data-stock"));
          const response = await fetch(`/api/carts/${cartId}`);
          const cart = await response.json();
          const productInCart = cart.products.find(p => p.product === productId);
          const quantityInCart = productInCart ? productInCart.quantity : 0;

          if (quantityInCart < productStock) {
            fetch(`/api/carts/${cartId}/product/${productId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ quantity: 1 })
            }).then(response => {
              if (response.ok) {
                console.log("Producto agregado al carrito");
              } else {
                console.error("Error al agregar producto al carrito");
              }
            });
          } else {
            alert("No hay suficiente stock disponible para agregar más de este producto al carrito.");
          }
        });
      });

      document.querySelectorAll(".remove-product").forEach(button => {
        button.addEventListener("click", (event) => {
          const productId = event.target.getAttribute("data-id");
          if (confirm("¿Estás seguro que quieres borrar el producto?")) {
            fetch(`/api/products/${productId}`, {
              method: "DELETE"
            }).then(response => {
              if (response.ok) {
                console.log("Producto eliminado del catálogo");
                // Eliminar el producto del carrito
                fetch(`/api/carts/${cartId}/product/${productId}`, {
                  method: "DELETE"
                }).then(response => {
                  if (response.ok) {
                    console.log("Producto eliminado del carrito satisfactoriamente");
                    location.reload(); // Recargar la página para actualizar la lista de productos
                  } else {
                    console.error("Error al eliminar producto del carrito");
                  }
                });
              } else {
                console.error("Error al eliminar producto del catálogo");
              }
            });
          }
        });
      });
    });
  } else if (currentPath.startsWith('/carts')) {
    // Lógica específica para la página del carrito
    const cartList = document.getElementById("cart-list");
    if (!cartList) {
      console.error("Elemento con ID 'cart-list' no encontrado.");
      return; // Salir si no estamos en la página del carrito
    }

    document.querySelectorAll(".remove-product-cart").forEach(button => {
      button.addEventListener("click", (event) => {
        const productId = event.target.getAttribute("data-id");
        const cartId = 'default-cart-id'; // Utilizar un único ID de carrito
        fetch(`/api/carts/${cartId}/product/${productId}`, {
          method: "DELETE"
        }).then(response => {
          if (response.ok) {
            console.log("Producto eliminado del carrito satisfactoriamente");
            // Verificar si el carrito está vacío
            fetch(`/api/carts/${cartId}`)
              .then(response => response.json())
              .then(cart => {
                if (cart.products.length === 0) {
                  console.log('Carrito vacío');
                  location.reload(); // Recargar la página para actualizar la lista de productos
                } else {
                  // Actualizar la vista del carrito sin recargar la página
                  const productCard = event.target.closest('.product-card');
                  productCard.remove();
                }
              });
          } else {
            console.error("Error al eliminar producto del carrito");
          }
        });
      });
    });
  }
});
