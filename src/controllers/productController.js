import {
  fetchProducts,
  fetchProductById,
  addProduct,
  modifyProduct,
  removeProduct,
  fetchCategories
} from '../services/productService.js';

export const getProducts = async (req, res) => {
  try {
    const products = await fetchProducts(req.query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await fetchCategories();
    res.json({ status: 'success', payload: categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const newProduct = await addProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await modifyProduct(req.params.id, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await removeProduct(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(deletedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};