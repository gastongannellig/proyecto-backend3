import express from 'express';
import CartManager from '../managers/cartManager.js';

const router = express.Router();
const cartManager = new CartManager();

// Ruta POST /api/carts - Crea un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    console.error('Error al crear carrito:', error);
    res.status(500).json({ error: 'Error al crear carrito' });
  }
});

// Ruta GET /api/carts/:cid - Lista los productos de un carrito por su ID
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid);
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ error: 'Carrito no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
});

// Ruta POST /api/carts/:cid/product/:pid - Agrega un producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body; // Obtiene la cantidad del cuerpo de la solicitud
    const updatedCart = await cartManager.addProductToCart(cid, pid, quantity);
    if (updatedCart) {
      res.status(201).json(updatedCart);
    } else {
      res.status(404).json({ error: 'Carrito o producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

// Ruta PUT /api/carts/:cid/product/:pid - Actualiza la cantidad de un producto en el carrito
router.put('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body; // Obtiene la cantidad del cuerpo de la solicitud
    const updatedCart = await cartManager.updateProductQuantityInCart(cid, pid, quantity);
    if (updatedCart) {
      res.status(200).json(updatedCart);
    } else {
      res.status(404).json({ error: 'Carrito o producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar producto en el carrito:', error);
    res.status(500).json({ error: 'Error al actualizar producto en el carrito' });
  }
});

// Ruta DELETE /api/carts/:cid/product/:pid - Elimina un producto del carrito
router.delete('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.removeProductFromCart(cid, pid);
    if (updatedCart) {
      res.status(200).json(updatedCart);
    } else {
      res.status(404).json({ error: 'Carrito o producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({ error: 'Error al eliminar producto del carrito' });
  }
});

export default router;
