import { registerUser, loginUser } from '../services/authService.js';

export const register = async (req, res) => {
  try {
    const newUser = await registerUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);
    res.cookie('jwt', token, { httpOnly: true });
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).send('Logged out');
};

export const current = (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};