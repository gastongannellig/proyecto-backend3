import { fork } from 'child_process';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Command } from 'commander';
import config from './config/config.js';

dotenv.config();

const program = new Command();
program
  .version('1.0.0')
  .description('Gestión de procesos para la aplicación Backend')
  .option('-s, --seed-products', 'Insertar productos iniciales en la base de datos')
  .option('-c, --clear-carts', 'Eliminar todos los carritos de la base de datos')
  .option('-e, --show-env', 'Mostrar variables de entorno cargadas')
  .parse(process.argv);

const options = program.opts();

const executeProcess = () => {
  if (options.seedProducts) {
    const child = fork('./src/workers/seedProducts.js');
    child.on('exit', (code) => {
      console.log(`Proceso de seed finalizado con código: ${code}`);
      mongoose.connection.close();
    });
  } else if (options.clearCarts) {
    const child = fork('./src/workers/clearCarts.js');
    child.on('exit', (code) => {
      console.log(`Proceso de limpieza de carritos finalizado con código: ${code}`);
      mongoose.connection.close();
    });
  } else if (options.showEnv) {
    console.log('Variables de entorno cargadas:');
    console.log(`MONGO_URI: ${config.MONGO_URI}`);
    console.log(`PORT: ${config.PORT}`);
    mongoose.connection.close();
  } else {
    console.log('Comando no reconocido. Usa --help para ver las opciones disponibles.');
    mongoose.connection.close();
  }
};

mongoose.connect(config.MONGO_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    executeProcess();
  })
  .catch((error) => {
    console.error('Error al conectar a MongoDB:', error);
  });