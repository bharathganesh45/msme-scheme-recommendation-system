import express from 'express';
import { recommendSchemes, getAllSchemes } from '../controllers/schemeController.js';

const router = express.Router();


router.post('/recommend', recommendSchemes);


router.get('/', getAllSchemes);


export default router;