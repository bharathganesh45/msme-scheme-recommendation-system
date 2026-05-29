import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';


// All routes are protected
router.use(authMiddleware);


router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

router.put('/change-password', userController.changepassword);
router.delete('/account', userController.deleteAccount);

// Saved schemes routes
router.post('/schemes/save', userController.saveScheme);
router.delete('/schemes/save/:schemeId', userController.unsaveScheme);
router.get('/schemes/saved', userController.getSavedSchemes);
router.get('/schemes/save/:schemeId', userController.checkSchemeSaved);


export default router;