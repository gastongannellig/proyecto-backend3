import mongoose from 'mongoose';

const cartsCollection = "carts";

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
      quantity: { type: Number, required: true }
    }
  ]
}, { versionKey: false });

const Cart = mongoose.model(cartsCollection, cartSchema);

export default Cart;