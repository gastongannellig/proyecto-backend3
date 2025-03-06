import express from 'express';
import Cart from '../models/carts.model.js';
import { handlePolicies } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta GET /api/carts/:cid - Obtiene un carrito por su ID
router.get('/:cid', handlePolicies(['user', 'admin']), async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await Cart.findById(cartId).populate('products.product');
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(cart);
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
});

// Ruta POST /api/carts - Crea un nuevo carrito
router.post('/', handlePolicies(['user', 'admin']), async (req, res) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    console.error('Error al crear carrito:', error);
    res.status(500).json({ error: 'Error al crear carrito' });
  }
});

// Ruta POST /api/carts/:cid/products - Agrega un producto al carrito
router.post('/:cid/products', handlePolicies(['user', 'admin']), async (req, res) => {
  try {
    const cartId = req.params.cid;
    const { productId, quantity } = req.body;

    const cart = await Cart.findById(cartId).populate('products.product');
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId);
    if (productIndex > -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();

    const io = req.app.get("socketio");
    io.emit("productAddedToCart", cart); // Emitir evento de adición de producto al carrito

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

// Ruta DELETE /api/carts/:cid/products/:pid - Elimina un producto del carrito
router.delete('/:cid/products/:pid', handlePolicies(['user', 'admin']), async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    const cart = await Cart.findById(cartId).populate('products.product');
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    cart.products = cart.products.filter(p => p.product._id.toString() !== productId);

    await cart.save();

    const io = req.app.get("socketio");
    io.emit("productRemovedFromCart", { cartId, productId }); // Emitir evento de eliminación de producto del carrito

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({ error: 'Error al eliminar producto del carrito' });
  }
});

// Ruta PUT /api/carts/:cid - Actualiza el carrito con un arreglo de productos
router.put('/:cid', handlePolicies(['user', 'admin']), async (req, res) => {
  try {
    const cartId = req.params.cid;
    const { products } = req.body;

    const cart = await Cart.findById(cartId).populate('products.product');
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    cart.products = products;

    await cart.save();

    const io = req.app.get("socketio");
    io.emit("updateCart", cart);

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error al actualizar carrito:', error);
    res.status(500).json({ error: 'Error al actualizar carrito' });
  }
});

// Ruta PUT /api/carts/:cid/products/:pid - Actualiza la cantidad de un producto en el carrito
router.put('/:cid/products/:pid', handlePolicies(['user', 'admin']), async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const { quantity } = req.body;

    const cart = await Cart.findById(cartId).populate('products.product');
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(p => p.product._id.toString() === productId);
    if (productIndex > -1) {
      cart.products[productIndex].quantity = quantity;
    } else {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    await cart.save();

    const io = req.app.get("socketio");
    io.emit("updateCart", cart);

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error al actualizar cantidad de producto en el carrito:', error);
    res.status(500).json({ error: 'Error al actualizar cantidad de producto en el carrito' });
  }
});

// Ruta DELETE /api/carts/:cid - Elimina todos los productos del carrito
router.delete('/:cid', handlePolicies(['user', 'admin']), async (req, res) => {
  try {
    const cartId = req.params.cid;

    const cart = await Cart.findById(cartId).populate('products.product');
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    cart.products = [];

    await cart.save();

    const io = req.app.get("socketio");
    io.emit("updateCart", cart);

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error al eliminar todos los productos del carrito:', error);
    res.status(500).json({ error: 'Error al eliminar todos los productos del carrito' });
  }
});

export default router;