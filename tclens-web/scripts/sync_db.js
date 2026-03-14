const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    console.log('Connecting to:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
    const conn = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    console.log('Connected');
    try {
        await conn.execute('ALTER TABLE user ADD COLUMN password TEXT');
        console.log('Added password to user');
    } catch (e) {
        console.log('Note: user.password might already exist or error:', e.message);
    }

    try {
        await conn.execute('ALTER TABLE user ADD COLUMN first_name TEXT');
        await conn.execute('ALTER TABLE user ADD COLUMN last_name TEXT');
        console.log('Added first_name/last_name to user');
    } catch (e) {
        console.log('Note: user fields might exist:', e.message);
    }

    try {
        await conn.execute('ALTER TABLE account MODIFY COLUMN provider_id TEXT');
        console.log('Modified account.provider_id');
    } catch (e) {
        console.log('Note: account.provider_id error:', e.message);
    }
    await conn.end();
}

run().catch(console.error);
