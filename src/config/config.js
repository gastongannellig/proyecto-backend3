import dotenv from 'dotenv';
import path from 'path';

// Determinar el entorno actual (por defecto, 'development')
const environment = process.env.NODE_ENV || 'development';

// Cargar el archivo .env correspondiente al entorno
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${environment}`)
});

// Exportar las variables de entorno como un objeto
export default {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  SECRET_KEY: process.env.SECRET_KEY,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS
};