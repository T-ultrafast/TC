const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
    // Connect to sys or without a specific db to create the target db
    const connection = await mysql.createConnection({
        host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
        port: 4000,
        user: '37fewemDo9WMTar.root',
        password: 'd16Hf7X7M9fSpV49',
        ssl: {
            rejectUnauthorized: false
        }
    });

    console.log('Connected to TiDB...');
    try {
        await connection.query('CREATE DATABASE IF NOT EXISTS tclens;');
        console.log('Database "tclens" created or already exists.');
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await connection.end();
    }
}

init();
