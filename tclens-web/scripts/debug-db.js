const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
    console.log('Testing connection to tclens...');
    try {
        const connection = await mysql.createConnection({
            host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
            port: 4000,
            user: '37fewemDo9WMTar.root',
            password: 'd16Hf7X7M9fSpV49',
            database: 'tclens',
            ssl: {
                rejectUnauthorized: false
            }
        });
        console.log('Connected to tclens!');

        console.log('Checking current database...');
        const [dbRes] = await connection.query('SELECT DATABASE();');
        console.log('Current DB:', dbRes);

        console.log('Trying to create a test table WITHOUT foreign keys...');
        await connection.query('CREATE TABLE IF NOT EXISTS test_v1 (id VARCHAR(36) PRIMARY KEY);');
        console.log('Successfully created test_v1 table!');

        await connection.end();
    } catch (err) {
        console.error('DETAILED ERROR:', err);
    }
}

test();
