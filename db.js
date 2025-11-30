// db.js
require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("Connected to DB...");

        const res = await client.query("SELECT NOW()");
        console.log("Database time:", res.rows[0]);

    } catch (err) {
        console.error("Connection error:", err);
    } finally {
        await client.end();
    }
}

testConnection();
