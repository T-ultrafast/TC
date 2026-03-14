import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function check() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await connection.execute('DESCRIBE user');
    console.log(JSON.stringify(rows, null, 2));
    await connection.end();
}

check().catch(console.error);
