import dotenv from 'dotenv';
dotenv.config();


import pkg from 'pg';
const { Pool } = pkg;


const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});


pool.on('connect', () => {
    console.log('Connected to local Postgres database');
});


pool.on('error', () => {
    console.log('Unexpected Database error', err);
    process.exit(-1);
});


export default {
    query: (text, params) => pool.query(text, params),
    pool
};