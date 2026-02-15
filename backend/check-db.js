const pool = require('./config/db');

async function checkData() {
    try {
        console.log('--- Predefined Names ---');
        const names = await pool.query('SELECT name, avatar_url FROM predefined_names');
        console.table(names.rows);

        console.log('\n--- Events ---');
        const events = await pool.query('SELECT id, person_name, media_path, media_type, status, created_at FROM events ORDER BY created_at DESC LIMIT 10');
        console.table(events.rows);

        process.exit(0);
    } catch (err) {
        console.error('Error checking DB:', err);
        process.exit(1);
    }
}

checkData();
