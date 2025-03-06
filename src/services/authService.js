import User from '../models/user.model.js';
import { createHash, generateToken, isValidPassword } from '../utils.js';

export const registerUser = async (userData) => {
  const { first_name, last_name, email, age, password, cart } = userData;
  const hashedPassword = createHash(password);
  const newUser = new User({ first_name, last_name, email, age, password: hashedPassword, cart });
  await newUser.save();
  return newUser;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !isValidPassword(user, password)) {
    throw new Error('Invalid email or password');
  }
  const token = generateToken(user);
  return { user, token };
};