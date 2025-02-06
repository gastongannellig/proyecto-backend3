import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import viewsRouter from './routes/views.router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 8080;
const productsFilePath = path.resolve("src/data/products.json"); // Define productsFilePath

// Conectar a MongoDB
mongoose.connect("mongodb+srv://gastongannellig:53769421@codergannelli.5puq3.mongodb.net/Tienda?retryWrites=true&w=majority&appName=CoderGannelli")
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.error("Error al conectar a MongoDB:", error));

// Configuración de Handlebars
app.engine("handlebars", engine({
  extname: '.handlebars',
  defaultLayout: 'main',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
}));
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));

// Socket.io
app.set("socketio", io);

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Inicializar el servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export { io };