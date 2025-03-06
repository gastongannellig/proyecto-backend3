import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const SECRET_KEY = 'your-secret-key';

export const handlePolicies = (policies) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.jwt;
      if (!token) {
        req.user = { role: 'public' }; // Asignar rol "public" a usuarios no autenticados
        if (policies.includes('public')) {
          return next();
        } else {
          res.locals.showLoginAlert = true;
          return res.status(401).json({ error: 'No token provided', showLoginAlert: true });
        }
      }

      const decoded = jwt.verify(token, SECRET_KEY);
      const user = await User.findById(decoded.id);

      if (!user) {
        req.user = { role: 'public' }; // Asignar rol "public" a usuarios con token inválido
        res.locals.showLoginAlert = true;
        return res.status(401).json({ error: 'Invalid token', showLoginAlert: true });
      }

      if (!policies.includes(user.role)) {
        if (user.role === 'public') {
          res.locals.showLoginAlert = true;
          return res.status(403).json({ error: 'Debes iniciar sesión', showLoginAlert: true });
        }
        return res.status(403).json({ error: 'Access denied' });
      }

      req.user = user;
      next();
    } catch (error) {
      req.user = { role: 'public' }; // Asignar rol "public" a usuarios con error en la verificación del token
      res.locals.showLoginAlert = true;
      return res.status(401).json({ error: 'Unauthorized', showLoginAlert: true });
    }
  };
};