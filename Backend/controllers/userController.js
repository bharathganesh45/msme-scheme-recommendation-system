import User from '../models/user.js';
import db from '../config/db.js';


// get user profile


export const getProfile = async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id);
        
        res.json({
            success: true,
            data: {
                user
            
            }
        });
    } catch (error) {
        next(error);
    }
};

// Save scheme to collection
export const saveScheme = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { scheme_id } = req.body;

        if (!scheme_id) {
            return res.status(400).json({
                success: false,
                message: 'Please provide scheme_id'
            });
        }

        // Check if scheme exists
        const schemeCheck = await db.query(
            'SELECT id FROM schemes WHERE id = $1',
            [scheme_id]
        );

        if (schemeCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Scheme not found'
            });
        }

        // Insert into user_saved_schemes
        const result = await db.query(
            `INSERT INTO user_saved_schemes (user_id, scheme_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, scheme_id) DO NOTHING
            RETURNING *`,
            [userId, scheme_id]
        );

        res.json({
            success: true,
            message: 'Scheme saved to collection',
            data: { saved: result.rows.length > 0 }
        });
    } catch (error) {
        next(error);
    }
};

// Remove scheme from collection
export const unsaveScheme = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { schemeId } = req.params;

        const result = await db.query(
            'DELETE FROM user_saved_schemes WHERE user_id = $1 AND scheme_id = $2',
            [userId, schemeId]
        );

        res.json({
            success: true,
            message: 'Scheme removed from collection',
            data: { removed: result.rowCount > 0 }
        });
    } catch (error) {
        next(error);
    }
};

// Get all saved schemes for user
export const getSavedSchemes = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT s.* FROM schemes s
            INNER JOIN user_saved_schemes uss ON s.id = uss.scheme_id
            WHERE uss.user_id = $1
            ORDER BY uss.saved_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: { schemes: result.rows }
        });
    } catch (error) {
        next(error);
    }
};

// Check if scheme is saved
export const checkSchemeSaved = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { schemeId } = req.params;

        const result = await db.query(
            'SELECT id FROM user_saved_schemes WHERE user_id = $1 AND scheme_id = $2',
            [userId, schemeId]
        );

        res.json({
            success: true,
            data: { isSaved: result.rows.length > 0 }
        });
    } catch (error) {
        next(error);
    }
};



// update user profile


export const updateProfile = async (req, res, next) => {
    try {
        const {name, email } = req.body;


        const user = await User.update(req.user.id, { name, email });


        res.json({
            success: true,
            message: 'profile updated succesfully',
            data: { user }
        });
    } catch (error) {
        next (error);
    }
};

// change password

export const changepassword = async (req, res, next) => {
    try{
        const {currentPassword, newPassword} = req.body;


        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'please provide current and new password'
            });
        }


        // verify current Password
        const user = await User.findByEmail(req.user.email);
        const isValid = await User.verifyPassword(currentPassword, user.password_hash);


        if(!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }


        // Update password


        await User.updatePassword(req.user.id, newPassword);


        res.json({
            success: true,
            message: 'password changed succesfull'
        });
        
    } catch (error) {
        next(error);
    }
};


// Delete Account


export const deleteAccount = async (req, res, next) => {
    try {
        await User.delete(req.user.id);


        res.json({
            success: true,
            message: 'Account deleted succesfully'
        });


    } catch (error) {
        next(error);
    }
};