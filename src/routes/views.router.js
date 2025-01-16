import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import CartManager from '../managers/cartManager.js';

const router = Router();
const productsFilePath = path.resolve('src/data/products.json');
const cartManager = new CartManager();

router.get('/', (req, res) => {
  try {
    const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
    res.render('home', { title: 'Home', products });
  } catch (error) {
    console.error('Error al renderizar vista:', error);
    res.status(500).send('Error al renderizar vista');
  }
});

router.get('/realtimeproducts', (req, res) => {
  try {
    const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
    res.render('realTimeProducts', { title: 'Real-Time Products', products });
  } catch (error) {
    console.error('Error al renderizar vista:', error);
    res.status(500).send('Error al renderizar vista');
  }
});

router.get('/carts', async (req, res) => {
  try {
    const cartId = req.query.cartId; // Obtener el ID del carrito desde la consulta
    const cart = await cartManager.getCartById(cartId);
    res.render('carts', { title: 'Carrito', cart });
  } catch (error) {
    console.error('Error al renderizar vista:', error);
    res.status(500).send('Error al renderizar vista');
  }
});

export default router;
