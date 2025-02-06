import { Router } from 'express';
import Product from '../models/products.model.js';
import Cart from '../models/carts.model.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('home', { title: 'INICIO', products });
  } catch (error) {
    console.error('Error al renderizar vista:', error);
    res.status(500).send('Error al renderizar vista');
  }
});

router.get('/realtimeproducts', async (req, res) => {
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

    res.render('realTimeProducts', {
      title: 'TIENDA',
      products,
      currentPage: page,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      category
    });
  } catch (error) {
    console.error('Error al renderizar vista:', error);
    res.status(500).send('Error al renderizar vista');
  }
});

router.get('/carts', async (req, res) => {
  try {
    const cartId = req.query.cartId;
    const cart = await Cart.findById(cartId).populate('products.product');
    if (!cart) {
      return res.status(404).send('Carrito no encontrado');
    }
    res.render('carts', { title: 'CARRITO', cart });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).send('Error al obtener carrito');
  }
});

export default router;