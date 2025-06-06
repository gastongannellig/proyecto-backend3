import express from 'express';
import session from 'express-session';
import cookieParser from "cookie-parser";
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import passport from './config/passport.config.js';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import viewsRouter from './routes/views.router.js';
import sessionsRouter from './routes/sessions.js';
import Router from './routes/router.js';
import mocksRouter from './routes/mocks.router.js';
import { helpers } from './helpers/handlebars.helpers.js';
import dotenv from 'dotenv';
import config from './config/config.js';
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = config.PORT || 8080;
const productsFilePath = path.resolve("src/data/products.json");

// Conectar a MongoDB
mongoose.connect(config.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.error("Error al conectar a MongoDB:", error));

// Configuración de Handlebars
app.engine('handlebars', engine({
    helpers: helpers,
    extname: '.handlebars',
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}));
app.set('views', './src/views');
app.set('view engine', 'handlebars');

// Middleware
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));

// Router
const router = new Router();
app.use(router.generateCustomResponse);


// Sesiones
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Cookies
app.use(cookieParser());

// Passport
app.use(passport.initialize());

// Socket.io
app.set("socketio", io);

io.on("connection", (socket) => {

  socket.on("updateCart", (cart) => {
    io.emit("cartUpdated", cart);
  });
});

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/mocks', mocksRouter);

// Inicializar el servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export { io, app };