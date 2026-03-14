const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    console.log(`Connecting to ${process.env.DB_HOST}:${process.env.DB_PORT} as ${process.env.DB_USERNAME}...`);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USERNAME.replace(/'/g, ""), // Remove quotes if present
        password: process.env.DB_PASSWORD.replace(/'/g, ""),
        database: process.env.DB_DATABASE.replace(/'/g, ""),
        ssl: {
            rejectUnauthorized: false
        },
        multipleStatements: true
    });

    console.log('Connected to TiDB successfully!');

    try {
        const sqlPath = path.join(__dirname, '../drizzle/0000_lucky_arclight.sql');
        let sqlContent = fs.readFileSync(sqlPath, 'utf8');

        const statements = sqlContent
            .split('--> statement-breakpoint')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} SQL statements.`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].replace(/;$/, '');
            console.log(`Executing statement ${i + 1}/${statements.length}...`);
            try {
                await connection.query(statement);
                console.log(`  Done.`);
            } catch (err) {
                if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_KEYNAME') {
                    console.log(`  Statement ${i + 1} skipped: already exists.`);
                } else {
                    console.error(`  Error on statement ${i + 1}:`, err.message);
                }
            }
        }

        console.log('Migration finished successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
    }
}

runMigration();
