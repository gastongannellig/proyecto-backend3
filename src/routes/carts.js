import express from 'express';
import CartManager from '../managers/cartManager.js';

const router = express.Router();
const cartManager = new CartManager();

// Ruta GET /api/carts/:cid - Obtiene un carrito por su ID
router.get('/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartManager.getCartById(cartId);
    if (!cart) {
      const newCart = await cartManager.createCart(cartId);
      return res.status(201).json(newCart);
    }
    res.json(cart);
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
});

// Ruta POST /api/carts - Crea un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const { id } = req.body;
    const newCart = await cartManager.createCart(id);
    res.status(201).json(newCart);
  } catch (error) {
    console.error('Error al crear carrito:', error);
    res.status(500).json({ error: 'Error al crear carrito' });
  }
});

// Ruta POST /api/carts/:cid/product/:pid - Agrega un producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const { quantity } = req.body;
    const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);
    if (!updatedCart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(updatedCart);
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

// Ruta DELETE /api/carts/:cid/product/:pid - Elimina un producto del carrito
router.delete('/:cid/product/:pid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const updatedCart = await cartManager.removeProductFromCart(cartId, productId);
    if (!updatedCart) {
      return res.status(404).json({ error: 'Carrito o producto no encontrado' });
    }
    res.json(updatedCart);
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({ error: 'Error al eliminar producto del carrito' });
  }
});

export default router;
