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




// request reset password (send OTP via email)


export const requestPasswordReset = async (req, res, next) =>{
    try{
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
            });
        }
    
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset code has been sent'
            });
        }

        // Generate OTP
        const otp = await User.generatePasswordResetOTP(email);

        // In production, send OTP via email service
        // For now, we'll log it (in real app use nodemailer or similar)
        console.log(`Password reset OTP for ${email}: ${otp}`);

        // Send success response (don't reveal if user exists for security)
        res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a password reset code has been sent',
            // Remove this in production - only for testing:
            // otp: otp
        });
    
    } catch (error) {
        next(error);
    }
};

// Verify OTP for password reset

export const verifyPasswordResetOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP'
            });
        }

        const user = await User.verifyPasswordResetOTP(email, otp);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Generate a temporary token for password reset (valid for 15 minutes)
        const resetToken = jwt.sign(
            { email, purpose: 'password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            data: {
                resetToken
            }
        });

    } catch (error) {
        next(error);
    }
};

// Reset password with OTP verification

export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        // Validation
        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, OTP, and new password'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Verify OTP
        const user = await User.verifyPasswordResetOTP(email, otp);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Update password
        const updatedUser = await User.completePasswordReset(email, newPassword);

        if (!updatedUser) {
            return res.status(500).json({
                success: false,
                message: 'Failed to reset password'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
            data: {
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    name: updatedUser.name
                }
            }
        });

    } catch (error) {
        next(error);
    }
};