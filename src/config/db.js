import pkg from 'pg';

const { Pool } = pkg;

const db = new Pool({
    database: process.env.DATABASE,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    user: process.env.DB_USER
});

export default db;