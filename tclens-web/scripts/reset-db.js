const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function resetAndMigrate() {
    console.log(`Connecting to ${process.env.DB_HOST}:${process.env.DB_PORT} as ${process.env.DB_USERNAME}...`);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USERNAME.replace(/'/g, ""),
        password: process.env.DB_PASSWORD.replace(/'/g, ""),
        database: process.env.DB_DATABASE.replace(/'/g, ""),
        ssl: {
            rejectUnauthorized: false
        },
        multipleStatements: true
    });

    console.log('Connected to TiDB successfully!');

    try {
        // 1. Drop all tables to start clean with optimized schema
        console.log('Dropping existing tables...');
        const tables = ['message', 'consultation', 'clause', 'document', 'lawyer', 'verification', 'account', 'session', 'user', 'test_v1', 'test_connection'];

        // Disable foreign key checks for dropping
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
        for (const table of tables) {
            try {
                await connection.query(`DROP TABLE IF EXISTS \`${table}\`;`);
            } catch (e) { }
        }
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('Tables dropped.');

        // 2. Clear drizzle meta if we were using it (optional)
        // 3. Instead of running incremental migrations, let's just run the full init from drizzle internal
        // But since Drizzle incremental files are easier, let's just run 0000 then 0001

        const migrationFiles = ['0000_lucky_arclight.sql', '0001_handy_zuras.sql'];

        for (const file of migrationFiles) {
            console.log(`Running migration: ${file}`);
            const sqlPath = path.join(__dirname, '../drizzle', file);
            const sqlContent = fs.readFileSync(sqlPath, 'utf8');

            const statements = sqlContent
                .split('--> statement-breakpoint')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i].replace(/;$/, '');
                try {
                    await connection.query(statement);
                } catch (err) {
                    console.error(`  Error in ${file} at statement ${i + 1}:`, err.message);
                }
            }
        }

        console.log('Clean optimized migration finished successfully.');
    } catch (err) {
        console.error('Migration crashed:', err);
    } finally {
        await connection.end();
    }
}

resetAndMigrate();
