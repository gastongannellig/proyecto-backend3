import { Router } from 'express';
import Product from '../models/products.model.js';
import Cart from '../models/carts.model.js';
import { handlePolicies } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', handlePolicies(['public', 'user', 'admin']), async (req, res) => {
  try {
    const products = await Product.find();
    const isAdmin = req.user && req.user.role === 'admin';
    res.render('home', { title: 'INICIO', products, isAdmin });
  } catch (error) {
    console.error('Error al renderizar vista:', error);
    res.status(500).send('Error al renderizar vista');
  }
});

router.get('/realtimeproducts', handlePolicies(['public', 'user', 'admin']), async (req, res) => {
  try {
    let { page = 1, category } = req.query;
    page = Math.max(parseInt(page), 1); // Asegura que page sea >= 1
    const limit = 4;
    const filter = category ? { category } : {};
    const options = {
      limit,
      skip: (page - 1) * limit,
      lean: true
    };

    const [products, totalProducts] = await Promise.all([
      Product.find(filter, null, options),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    // Determinar si el usuario es administrador
    const isAdmin = req.user && req.user.role === 'admin';

    res.render('realTimeProducts', {
      title: 'TIENDA',
      products,
      currentPage: page,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      category,
      isAdmin // Pasar la variable isAdmin a la vista
    });
  } catch (error) {
    console.error('Error al renderizar vista:', error);
    res.status(500).send('Error al renderizar vista');
  }
});

router.get('/carts', handlePolicies(['user', 'admin']), async (req, res) => {
  try {
    const user = req.user;
    
    // Verificar si el usuario está autenticado y tiene un rol válido
    if (!user || (user.role !== 'user' && user.role !== 'admin')) {
      return res.redirect('/');
    }

    // Redirigir a la ruta específica del carrito del usuario
    res.redirect(`/carts/${user.cart}`);
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).send('Error al obtener carrito');
  }
});

router.get('/carts/:cid', handlePolicies(['user', 'admin']), async (req, res) => {
  try {
    const user = req.user;

    if (!user || (user.role !== 'user' && user.role !== 'admin')) {
      return res.redirect('/');
    }

    if (user.cart.toString() !== req.params.cid) {
      return res.redirect(`/carts/${user.cart}`);
    }

    const cart = await Cart.findById(user.cart).populate('products.product');
    if (!cart) {
      return res.status(404).send('Carrito no encontrado');
    }

    // Calcular el total del carrito
    const total = cart.products.reduce((sum, item) => {
      if (item.product && item.product.price) {
        return sum + item.quantity * item.product.price;
      }
      return sum;
    }, 0);

    res.render('carts', { 
      title: 'CARRITO', 
      cart,
      total, // Pasar el total a la plantilla
      user: req.user 
    });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).send('Error al obtener carrito');
  }
});

export default router;

