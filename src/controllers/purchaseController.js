import Cart from '../models/carts.model.js';
import Product from '../models/products.model.js';
import Ticket from '../models/ticket.model.js';
import { v4 as uuidv4 } from 'uuid';
import emailService from '../services/mail.service.js';

export const purchaseCart = async (req, res) => {
  try {
    const cartId = req.params.id;
    const { fullName, email, phone } = req.body;

    const cart = await Cart.findById(cartId).populate('products.product');
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío o no existe' });
    }

    let totalAmount = 0;
    const productsToUpdate = [];

    // Validar stock y calcular el total
    for (const item of cart.products) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({ 
          error: `Stock insuficiente para el producto: ${item.product.title}` 
        });
      }
      totalAmount += item.quantity * item.product.price;
      productsToUpdate.push({
        productId: item.product._id,
        newStock: item.product.stock - item.quantity
      });
    }

    // Actualizar el stock de los productos
    for (const { productId, newStock } of productsToUpdate) {
      await Product.findByIdAndUpdate(productId, { stock: newStock });
    }

    // Crear el ticket
    const ticket = new Ticket({
      code: uuidv4(),
      purchase_datetime: new Date(),
      amount: totalAmount,
      purchaser: email,
      details: {
        fullName,
        phone,
        products: cart.products.map(item => ({
          title: item.product.title,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    });
    await ticket.save();

    // Generar PDF y enviar email
    try {
      const pdfBuffer = await emailService.generateTicketPDF(ticket);
      await emailService.sendTicketEmail(ticket, pdfBuffer);
    } catch (emailError) {
      console.error('Error al enviar el email:', emailError);
      // No detenemos la compra si falla el envío del email
    }

    // Vaciar el carrito
    cart.products = [];
    await cart.save();

    // Emitir evento de Socket.IO
    const io = req.app.get("socketio");
    io.emit("cartUpdated", { cartId });

    res.status(201).json({ 
      message: 'Compra realizada con éxito. El ticket ha sido enviado a tu email.', 
      ticket 
    });
  } catch (error) {
    console.error('Error al procesar la compra:', error);
    res.status(500).json({ error: 'Error al procesar la compra' });
  }
};