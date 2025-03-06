import express from 'express';
import passport from 'passport';
import { register, login, logout, current } from '../controllers/userControllers.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/current', passport.authenticate('current', { session: false }), current);

export default router;