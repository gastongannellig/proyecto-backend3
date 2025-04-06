export const initializeCartEventListeners = () => {
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