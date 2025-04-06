import mongoose from 'mongoose';
import Product from '../models/products.model.js';
import productsData from '../data/products.json' assert { type: 'json' };
import config from '../config/config.js';

const seedProducts = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('Conectado a MongoDB para insertar productos.');

    // Eliminar productos existentes
    await Product.deleteMany({});
    console.log('Productos existentes eliminados.');

    // Insertar productos iniciales
    await Product.insertMany(productsData);
    console.log('Productos iniciales insertados correctamente.');

    process.exit(0); // Finalizar el proceso con éxito
  } catch (error) {
    console.error('Error al insertar productos:', error);
    process.exit(1); // Finalizar el proceso con error
  }
};

seedProducts();