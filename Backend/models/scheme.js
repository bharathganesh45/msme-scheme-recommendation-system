import db from '../config/db.js';

class Scheme {
    // Create new scheme
    static async create({ name, description, business_category, max_investment, location, rules, benefits, beneficiary_categories }) {
        const result = await db.query(
            `INSERT INTO schemes (name, description, business_category, max_investment, location, rules, benefits, beneficiary_categories)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [name, description, business_category, max_investment, location, JSON.stringify(rules), JSON.stringify(benefits), JSON.stringify(beneficiary_categories)]
        );
        return result.rows[0];
    }

    // Get all schemes
    static async findAll() {
        const result = await db.query('SELECT * FROM schemes');
        return result.rows;
    }

}

export default Scheme;