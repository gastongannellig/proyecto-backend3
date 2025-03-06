import express from 'express';
import Product from '../models/products.model.js';
import Cart from '../models/carts.model.js';
import { handlePolicies } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta GET /api/products - Lista todos los productos con paginación, ordenamiento y filtrado
router.get('/', handlePolicies(['public', 'user', 'admin']), async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;

    limit = Math.max(parseInt(limit), 1); // Asegura que limit sea >= 1
    page = Math.max(parseInt(page), 1); // Asegura que page sea >= 1

    const filter = query ? { category: query } : {};
    const options = {
      limit,
      skip: (page - 1) * limit,
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
      lean: true
    };

    const [products, totalProducts] = await Promise.all([
      Product.find(filter, null, options),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      status: 'success',
      payload: products,
      totalPages,
      currentPage: page,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Ruta GET /api/products/categories - Obtiene todas las categorías únicas
router.get('/categories', handlePolicies(['public', 'user', 'admin']), async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ status: 'success', payload: categories });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Ruta GET /api/products/:pid - Obtiene un producto por ID
router.get('/:pid', handlePolicies(['public', 'user', 'admin']), async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await Product.findById(productId).lean();
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
    const newProduct = new Product(req.body);
    await newProduct.save();

    const io = req.app.get("socketio");
    io.emit("updateProducts", newProduct); // Emitir evento de nuevo producto

    res.status(201).json({ status: 'success', payload: newProduct });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Ruta PUT /api/products/:pid - Actualiza un producto por ID
router.put('/:pid', handlePolicies(['admin']), async (req, res) => {
  try {
    const productId = req.params.pid;
    const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true, runValidators: true }).lean();
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const io = req.app.get("socketio");
    io.emit("updateProducts", updatedProduct); // Emitir evento de actualización de producto

    res.json({ status: 'success', payload: updatedProduct });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Ruta DELETE /api/products/:pid - Elimina un producto por ID
router.delete('/:pid', handlePolicies(['admin']), async (req, res) => {
  try {
    const productId = req.params.pid;
    const deletedProduct = await Product.findByIdAndDelete(productId).lean();
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Eliminar el producto de todos los carritos
    await Cart.updateMany(
      { 'products.product': productId },
      { $pull: { products: { product: productId } } }
    );

    const io = req.app.get("socketio");
    io.emit("productDeleted", productId); // Emitir evento de eliminación de producto

    // Emitir evento de actualización de carrito para todos los carritos afectados
    const carts = await Cart.find({ 'products.product': productId }).populate('products.product');
    carts.forEach(cart => {
      io.emit("updateCart", cart);
    });

    res.json({ status: 'success', payload: deletedProduct });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Ruta POST /api/products/:pid/cart - Agrega un producto al carrito
router.post('/:pid/cart', async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role === 'public') {
      return res.status(403).json({ showLoginAlert: true });
    }

    const productId = req.params.pid;
    const cartId = req.body.cartId;
    const quantity = req.body.quantity || 1;

    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
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

export default router;