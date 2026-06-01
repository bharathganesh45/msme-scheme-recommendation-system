import db from '../config/db.js';
import bcrypt from 'bcryptjs'

class User {

    // Create new user

    static async create ({ email,password,name,phone }) {
        const hashedPassword = await bcrypt.hash(password, 10);


        const result = await db.query(
            `INSERT INTO users (email, password_hash, name, phone)
            VALUES ($1,$2,$3,$4)
            RETURNING id, email, name, phone, created_at`,
                  [email, hashedPassword, name, phone]
        );
        return result.rows[0];
    }

    // Find user by email

    static async findByEmail(email) {
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    // Find user by ID

    static async findById(id) {
        const result = await db.query(
            'SELECT id, email, name, phone, created_at, updated_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Update Users

    static async update (id, updates) {
        const { name, email, phone } = updates;
        const result = await db.query(
            `UPDATE users
        SET name = COALESCE($1, name),
            email = COALESCE($2, email),
            phone = COALESCE($3, phone)
        WHERE id = $4
        RETURNING id, email, name, phone, updated_at`,
             [name, email, phone, id]
        );
        return result.rows[0];
    }

    // Update password

    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [hashedPassword, id]
        );
    }

    // Verify password

    static async verifyPassword (plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Delete user 

    static async delete (id) {
        await db.query('DELETE FROM users WHERE id = $1',[id]);
    }

    // Generate and store OTP for password reset

    static async generatePasswordResetOTP(email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 90 * 1000);

        const result = await db.query(
            `UPDATE users 
            SET reset_otp = $1, reset_otp_expires = $2
            WHERE email = $3
            RETURNING id, email`,
            [otp, otpExpires, email]
        );

        return result.rows[0] ? otp : null;
    }

    // Verify OTP

    static async verifyPasswordResetOTP(email, otp) {
        const result = await db.query(
            `SELECT * FROM users 
            WHERE email = $1 AND reset_otp = $2 AND reset_otp_expires > NOW()`,
            [email, otp]
        );

        return result.rows[0] || null;
    }

    // Complete password reset

    static async completePasswordReset(email, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await db.query(
            `UPDATE users 
            SET password_hash = $1, reset_otp = NULL, reset_otp_expires = NULL, updated_at = NOW()
            WHERE email = $2
            RETURNING id, email, name`,
            [hashedPassword, email]
        );

        return result.rows[0] || null;
    }

    // Clear OTP after expiration or use

    static async clearPasswordResetOTP(email) {
        await db.query(
            `UPDATE users 
            SET reset_otp = NULL, reset_otp_expires = NULL
            WHERE email = $1`,
            [email]
        );
    }
}


export default User;