import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs"; // Importa el módulo fs
import productsRouter from "./routes/products.js";
import cartsRouter from "./routes/carts.js";
import viewsRouter from "./routes/views.router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 8080;
const productsFilePath = path.resolve("src/data/products.json"); // Define productsFilePath

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// Configurar socket.io
io.on("connection", (socket) => {
  console.log("Cliente conectado");
  const products = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));
  socket.emit("updateProducts", products);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// Detectar cambios en products.json
fs.watchFile(productsFilePath, (curr, prev) => {
  console.log("products.json ha cambiado");
  const products = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));
  io.emit("updateProducts", products);
});

// Inicializar el servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export { io };
