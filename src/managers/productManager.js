import fs from "fs/promises";
import path from "path";
import { io } from "../app.js";

const productsFilePath = path.resolve("src/data/products.json");

class ProductManager {
  // Obtiene todos los productos, con limitación opcional
  async getProducts(limit) {
    try {
      const data = await fs.readFile(productsFilePath, "utf-8");
      const products = JSON.parse(data);
      return limit ? products.slice(0, parseInt(limit)) : products;
    } catch (error) {
      console.error("Error al obtener productos:", error);
      throw error;
    }
  }

  // Obtiene un producto por su ID
  async getProductById(id) {
    try {
      const products = await this.getProducts();
      return products.find((p) => p.id === id);
    } catch (error) {
      console.error("Error al obtener producto:", error);
      throw error;
    }
  }

  // Agrega un nuevo producto
  async addProduct(productData) {
    try {
      const products = await this.getProducts();
      const id = (Math.floor(Math.random() * 900) + 100).toString(); // Genera un ID único de hasta 3 cifras como string
      const newProduct = { id, ...productData, status: true }; // Asegura que el status sea true por defecto
      products.push(newProduct);
      await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
      io.emit("updateProducts", products); // Emite el nuevo estado de productos
      console.log(
        `Producto creado: ${newProduct.title} (ID: ${newProduct.id})`
      );
      return newProduct;
    } catch (error) {
      console.error("Error al agregar producto:", error);
      throw error;
    }
  }

  // Actualiza un producto por su ID
  async updateProduct(id, updates) {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex((p) => p.id === id);
      if (productIndex === -1) return null;
      const updatedProduct = {
        ...products[productIndex],
        ...updates,
        id,
        status: true,
      }; // Asegura que el status se mantenga true
      products[productIndex] = updatedProduct;
      await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
      io.emit("updateProducts", products); // Emite el nuevo estado de productos
      console.log(
        `Producto actualizado: ${updatedProduct.title} (ID: ${updatedProduct.id})`
      );
      return updatedProduct;
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      throw error;
    }
  }

  // Elimina un producto por su ID
  async deleteProduct(id) {
    try {
      const products = await this.getProducts();
      const newProducts = products.filter((p) => p.id !== id);
      if (newProducts.length === products.length) return false;
      await fs.writeFile(
        productsFilePath,
        JSON.stringify(newProducts, null, 2)
      );
      io.emit("updateProducts", newProducts); // Emite el nuevo estado de productos
      console.log(`Producto eliminado (ID: ${id})`);
      return true;
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      throw error;
    }
  }
}

export default ProductManager;
