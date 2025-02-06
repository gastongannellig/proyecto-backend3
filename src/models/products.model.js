import mongoose from 'mongoose';

const productsCollection = "products";

const urlValidator = (value) => {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return Array.isArray(value) && (value.length === 0 || value.every(url => urlRegex.test(url)));
};

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  thumbnails: { 
    type: [String], 
    default: [], 
    validate: {
      validator: urlValidator,
      message: props => `${props.value} no es una URL válida.`
    }
  },
  status: { type: Boolean, default: true }
});

const Product = mongoose.model(productsCollection, productSchema);

export default Product;