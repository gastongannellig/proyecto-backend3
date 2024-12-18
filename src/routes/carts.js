import express from "express";
import CartManager from "../managers/cartManager.js";

const router = express.Router();
const cartManager = new CartManager();

// Ruta POST /api/carts - Crea un nuevo carrito
router.post("/", async (req, res) => {
  const newCart = await cartManager.createCart();
  res.status(201).json(newCart);
});

// Ruta GET /api/carts/:cid - Lista los productos de un carrito por su ID
router.get("/:cid", async (req, res) => {
  const { cid } = req.params;
  const cart = await cartManager.getCartById(cid);
  if (cart) {
    res.json(cart);
  } else {
    res.status(404).json({ error: "Carrito no encontrado" });
  }
});

// Ruta POST /api/carts/:cid/product/:pid - Agrega un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body; // Obtiene la cantidad del cuerpo de la solicitud
  const updatedCart = await cartManager.addProductToCart(cid, pid, quantity);
  if (updatedCart) {
    res.status(201).json(updatedCart);
  } else {
    res.status(404).json({ error: "Carrito o producto no encontrado" });
  }
});

// Ruta PUT /api/carts/:cid/product/:pid - Actualiza la cantidad de un producto en el carrito
router.put("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body; // Obtiene la cantidad del cuerpo de la solicitud
  const updatedCart = await cartManager.updateProductQuantityInCart(
    cid,
    pid,
    quantity
  );
  if (updatedCart) {
    res.status(200).json(updatedCart);
  } else {
    res.status(404).json({ error: "Carrito o producto no encontrado" });
  }
});

// Ruta DELETE /api/carts/:cid/product/:pid - Elimina un producto del carrito
router.delete("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const updatedCart = await cartManager.removeProductFromCart(cid, pid);
  if (updatedCart) {
    res.status(200).json(updatedCart);
  } else {
    res.status(404).json({ error: "Carrito o producto no encontrado" });
  }
});

export default router;
