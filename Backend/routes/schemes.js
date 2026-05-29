import express from 'express';
import { recommendSchemes, getAllSchemes } from '../controllers/schemeController.js';

const router = express.Router();

// POST /api/schemes/recommend - Recommend schemes based on user input
router.post('/recommend', recommendSchemes);

// GET /api/schemes - Get all schemes
router.get('/', getAllSchemes);


export default router;