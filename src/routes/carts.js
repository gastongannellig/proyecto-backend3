import express from 'express';
import Cart from '../models/carts.model.js';
import Product from '../models/products.model.js'; // Agregar esta importación
import { handlePolicies } from '../middlewares/authMiddleware.js';
import { purchaseCart } from '../controllers/purchaseController.js';

const router = express.Router();

// Ruta GET /api/carts/:cid - Obtiene un carrito por su ID
router.get('/:cid', handlePolicies(['user', 'admin']), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Debes iniciar sesión', 
        showLoginAlert: true 
      });
    }

    // Solo permitir acceso al carrito del usuario
    const cart = await Cart.findById(req.user.cart).populate('products.product');
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(cart);
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
});

// Obtener el carrito del usuario actual
router.get('/my-cart', handlePolicies(['user', 'admin']), async (req, res) => {
  try {
    if (!req.user || !req.user.cart) {
      return res.status(401).json({ 
        error: 'Debes iniciar sesión', 
        showLoginAlert: true 
      });
    }

    const cart = await Cart.findById(req.user.cart).populate('products.product');
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(cart);
  } catch (error) {
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
    const { productId, quantity = 1 } = req.body;

    // Verificar si el producto existe y tiene stock suficiente
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const cart = await Cart.findById(cartId).populate('products.product');
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    // Verificar stock disponible
    const productInCart = cart.products.find(p => p.product?._id.toString() === productId);
    const currentQuantity = productInCart ? productInCart.quantity : 0;
    const newTotalQuantity = currentQuantity + quantity;

    if (newTotalQuantity > product.stock) {
      return res.status(400).json({ 
        error: `Stock insuficiente. Stock disponible: ${product.stock}` 
      });
    }

    // Actualizar o agregar el producto al carrito
    if (productInCart) {
      productInCart.quantity = newTotalQuantity;
    } else {
      cart.products.push({ 
        product: productId, 
        quantity 
      });
    }

    await cart.save();

    // Emitir evento de Socket.IO
    const io = req.app.get("socketio");
    io.emit("productAddedToCart", cart);

    res.status(200).json(cart);
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

// Agregar producto al carrito del usuario
router.post('/add-product', handlePolicies(['user', 'admin']), async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const { productId, quantity } = req.body;
    const cart = await Cart.findById(user.cart).populate('products.product');
    
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
    io.emit("cartUpdated", { cartId: req.user.cart });

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

// Ruta DELETE /api/carts/:cid/products/:pid - Elimina un producto del carrito
router.delete('/:cid/products/:pid', handlePolicies(['user', 'admin']), async (req, res) => {
  try {
    const cart = await Cart.findById(req.user.cart);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    cart.products = cart.products.filter(p => p.product.toString() !== req.params.pid);
    await cart.save();

    const io = req.app.get("socketio");
    io.emit("productRemovedFromCart", { cartId: req.user.cart, productId: req.params.pid });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
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
    const cart = await Cart.findById(req.user.cart);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    cart.products[productIndex].quantity = req.body.quantity;
    await cart.save();

    const io = req.app.get("socketio");
    io.emit("updateCart", cart);

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cantidad' });
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

// Ruta POST /api/carts/:id/purchase - Finaliza la compra del carrito
router.post('/:id/purchase', handlePolicies(['user', 'admin']), purchaseCart);

// Limpiar el carrito del localStorage al cerrar sesión
function handleLogout() {
  localStorage.removeItem('cartId');
  // ... código de cierre de sesión existente
}

// Actualizar el cartId en localStorage al iniciar sesión
function handleLogin(userData) {
  if (userData.cart) {
    localStorage.setItem('cartId', userData.cart);
  }
  // ... código de inicio de sesión existente
}

export default router;