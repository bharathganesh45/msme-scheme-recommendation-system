import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';



router.post('/signup', authController.register);
router.post('/login', authController.login);
router.post('/reset-password/request', authController.requestPasswordReset);
router.post('/reset-password/verify-otp', authController.verifyPasswordResetOTP);
router.post('/reset-password', authController.resetPassword);



router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/profile', authMiddleware, authController.updateProfile);


export default router;