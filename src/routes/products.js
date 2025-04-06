import express from 'express';
import {
  fetchProducts,
  fetchProductById,
  addProduct,
  modifyProduct,
  removeProduct,
  fetchCategories
} from '../services/productService.js';
import { handlePolicies } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta GET /api/products - Lista todos los productos con paginación, ordenamiento y filtrado
router.get('/', handlePolicies(['public', 'user', 'admin']), async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const filter = query ? { category: query } : {};
    const options = {
      limit: Math.max(parseInt(limit), 1),
      page: Math.max(parseInt(page), 1),
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
    };

    const products = await fetchProducts(filter, options);
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Ruta GET /api/products/categories - Obtiene todas las categorías únicas
router.get('/categories', handlePolicies(['public', 'user', 'admin']), async (req, res) => {
  try {
    const categories = await fetchCategories();
    res.json({ status: 'success', payload: categories });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Ruta GET /api/products/:pid - Obtiene un producto por ID
router.get('/:pid', handlePolicies(['public', 'user', 'admin']), async (req, res) => {
  try {
    const product = await fetchProductById(req.params.pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Ruta POST /api/products - Crea un nuevo producto
router.post('/', handlePolicies(['admin']), async (req, res) => {
  try {
    const newProduct = await addProduct(req.body);

    const io = req.app.get("socketio");
    io.emit("updateProducts", newProduct);

    res.status(201).json({ status: 'success', payload: newProduct });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Ruta PUT /api/products/:pid - Actualiza un producto por ID
router.put('/:pid', handlePolicies(['admin']), async (req, res) => {
  try {
    const updatedProduct = await modifyProduct(req.params.pid, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const io = req.app.get("socketio");
    io.emit("updateProducts", updatedProduct);

    res.json({ status: 'success', payload: updatedProduct });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Ruta DELETE /api/products/:pid - Elimina un producto por ID
router.delete('/:pid', handlePolicies(['admin']), async (req, res) => {
  try {
    const deletedProduct = await removeProduct(req.params.pid);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const io = req.app.get("socketio");
    io.emit("productDeleted", req.params.pid);

    res.json({ status: 'success', message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;