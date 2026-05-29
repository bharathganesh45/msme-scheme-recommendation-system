import User from '../models/user.js';
import jwt from 'jsonwebtoken';


// generate jwt token


const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '365d' }
    );
};


// Register new user 


export const register = async (req, res, next) => {
    try{
        const { email, password, name, phone } = req.body;


        //Validation


        if (!email || !password || !name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, password, name, and phone'
            });
        }


        // check if user exists 


        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }


        // Create users
        const user = await User.create({ email, password, name, phone });


        //Generate token
        const token = generateToken(user);


        res.status(201).json({
            success: true,
            message: 'User registration successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone
                },
                token


            }
        });
    } catch (error) {
        next(error);
    }
};


// Login User


export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;


        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'please provide email and password'
            });
        }


        // Find user
        const user = await User.findByEmail(email);
        if(!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid user'
            });
        }


        //verify password
        const isPasswordValid = await User.verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }


        //Generate token
        const token = generateToken(user);


        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};


// Get current user


export const getCurrentUser = async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id);


        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }


        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};


// Update user profile

export const updateProfile = async (req, res, next) => {
    try{
        const { name, phone } = req.body;
        const userId = req.user.id;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name and phone'
            });
        }

        if (!/^[0-9]{10}$/.test(phone.replace(/\D/g, ''))) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit phone number'
            });
        }

        const updatedUser = await User.update(userId, { name, phone });

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { 
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    phone: updatedUser.phone
                }
            }
        });
    } catch (error) {
        next(error);
    }
};




// request reset password (placeholder - would send email in production)


export const requestPasswordReset = async (req, res, next) =>{
    try{
        const { email } = req.body;


        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'please provide email'
            });
        }
    
        const user = await User.findByEmail(email);


        //dont reveal if user exists or not for security
        res.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been send'
        });
    
    } catch {
        next(error);
    }
};