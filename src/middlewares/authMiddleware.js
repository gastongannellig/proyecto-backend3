import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Cart from '../models/carts.model.js';

const SECRET_KEY = 'your-secret-key';

export const handlePolicies = (policies) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.jwt;
      
      if (!token) {
        if (policies.includes('public')) {
          return next();
        }
        // Si es una petición AJAX, devolver JSON
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
          return res.status(401).json({ 
            error: 'Debes iniciar sesión', 
            showLoginAlert: true 
          });
        }
        // Si es una petición normal, redirigir al index con la señal de mostrar alerta
        res.locals.showLoginAlert = true;
        return res.redirect('/?showLogin=true');
      }

      const decoded = jwt.verify(token, SECRET_KEY);
      const user = await User.findById(decoded.id);

      if (!user) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
          return res.status(401).json({ 
            error: 'Usuario no encontrado', 
            showLoginAlert: true 
          });
        }
        res.locals.showLoginAlert = true;
        return res.redirect('/');
      }

      // Asegurar que el usuario tenga un carrito
      if (!user.cart && (user.role === 'user' || user.role === 'admin')) {
        const newCart = new Cart({ products: [] });
        await newCart.save();
        user.cart = newCart._id;
        await user.save();
      }

      req.user = user;
      next();
    } catch (error) {
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ 
          error: 'Token inválido', 
          showLoginAlert: true 
        });
      }
      res.locals.showLoginAlert = true;
      return res.redirect('/?showLogin=true');
    }
  };
};