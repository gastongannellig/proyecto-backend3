import mongoose from 'mongoose';
import Cart from '../models/carts.model.js';
import config from '../config/config.js';

const clearCarts = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('Conectado a MongoDB para limpiar carritos.');

    // Eliminar todos los carritos
    await Cart.deleteMany({});
    console.log('Todos los carritos han sido eliminados.');

    process.exit(0); // Finalizar el proceso con éxito
  } catch (error) {
    console.error('Error al limpiar carritos:', error);
    process.exit(1); // Finalizar el proceso con error
  }
};

clearCarts();