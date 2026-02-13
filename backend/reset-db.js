const fs = require('fs');
const path = require('path');
// Load .env from the backend directory specifically
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./config/db');

async function resetDatabase() {
    try {
        const sqlPath = path.join(__dirname, 'models/init.sql');
        console.log(`Reading SQL from ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Resetting database...');

        // Drop tables in correct order
        const dropQueries = [
            'DROP TABLE IF EXISTS verifications CASCADE',
            'DROP TABLE IF EXISTS scores CASCADE',
            'DROP TABLE IF EXISTS events CASCADE',
            'DROP TABLE IF EXISTS event_types CASCADE',
            'DROP TABLE IF EXISTS predefined_names CASCADE'
        ];

        for (const query of dropQueries) {
            console.log(`Executing: ${query}`);
            await pool.query(query);
        }

        console.log('Tables dropped.');

        // Split SQL by semicolons, but be careful about comments and empty lines
        // Remove comments
        const cleanSql = sql.replace(/--.*$/gm, '');

        const statements = cleanSql.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            console.log(`Executing statement starting with: ${statement.substring(0, 50)}...`);
            await pool.query(statement);
        }

        console.log('Database reset successfully!');
    } catch (err) {
        console.error('Error resetting database:', err);
    } finally {
        await pool.end();
    }
}

resetDatabase();
