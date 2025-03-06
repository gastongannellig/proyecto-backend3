import User from '../models/user.model.js';

export const getUserById = async (id) => {
  try {
    const user = await User.findById(id).populate('cart');
    return user;
  } catch (error) {
    throw new Error('Error al obtener el usuario por ID');
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email }).populate('cart');
    return user;
  } catch (error) {
    throw new Error('Error al obtener el usuario por email');
  }
};

export const updateUser = async (id, updateData) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).populate('cart');
    return updatedUser;
  } catch (error) {
    throw new Error('Error al actualizar el usuario');
  }
};