import express from 'express';


import dotenv from 'dotenv';


dotenv.config();


import cors from 'cors'


//Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import schemeRoutes from './routes/schemes.js';


const app = express();


//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));


//Test Routes


app.get('/', (req,res) => {
    res.json({ message: 'MSME SGNEME GENERATOR'});
});


// Api route
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schemes', schemeRoutes);


const PORT = process.env.PORT || 8000;


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});