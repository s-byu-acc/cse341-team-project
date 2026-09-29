import { Router } from 'express';
import { login, loginPage, logout, register, registerPage } from '../controllers/auth.js';

const router = Router();

router.get('/login', loginPage);
router.post('/login', login);
router.get('/register', registerPage);
router.post('/register', register);
router.post('/logout', logout);

export default router;