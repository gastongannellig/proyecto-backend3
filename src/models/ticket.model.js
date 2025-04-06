import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  purchase_datetime: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true },
  details: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    products: [
      {
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
});

export default mongoose.model('Ticket', ticketSchema);