import User from '../models/user.model.js';
import Cart from '../models/carts.model.js';
import { createHash, generateToken, isValidPassword } from '../utils.js';

export const registerUser = async (userData) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();

    const { first_name, last_name, email, age, password } = userData;
    const hashedPassword = createHash(password);
    
    const newUser = new User({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
      cart: newCart._id
    });

    await newUser.save();
    return newUser;
  } catch (error) {
    console.error('Error en registerUser:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user || !isValidPassword(user, password)) {
      throw new Error('Email o contraseñas inválidos.');
    }

    // Verificar si el usuario ya tiene un carrito
    if (!user.cart) {
      const newCart = new Cart({ products: [] });
      await newCart.save();
      user.cart = newCart._id;
      await user.save();
    }

    const token = generateToken(user);
    return { user, token };
  } catch (error) {
    throw error;
  }
};