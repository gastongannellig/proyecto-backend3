document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const productList = document.getElementById('product-list');

  if (productList) {
    socket.on('updateProducts', (products) => {
      productList.innerHTML = '';
      products.forEach((product) => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
          <h2>${product.title}</h2>
          <p>Price: ${product.price}</p>
          <p>Stock: ${product.stock}</p>
        `;
        productList.appendChild(productItem);
      });
    });
  } else {
    console.error("Elemento con ID 'product-list' no encontrado.");
  }
});
