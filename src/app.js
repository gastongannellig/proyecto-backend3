import express from "express";
import productsRouter from "./routes/products.js";
import cartsRouter from "./routes/carts.js";

const app = express();
const PORT = 8080;

app.use(express.json());

// Rutas para productos y carritos.
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

//listen servidor corriendo en el puerto.
app.listen(PORT, () => {
  console.log(`Servidor corriendo en https://localhost:${PORT}`);
});
