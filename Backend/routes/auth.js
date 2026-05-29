import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';



router.post('/signup', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.requestPasswordReset);



router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/profile', authMiddleware, authController.updateProfile);


export default router;