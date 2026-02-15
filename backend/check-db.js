const pool = require('./config/db');

async function checkData() {
    try {
        console.log('--- Predefined Names ---');
        const names = await pool.query('SELECT name, avatar_url FROM predefined_names');
        console.table(names.rows);

        console.log('\n--- Events with Media ---');
        const events = await pool.query('SELECT id, person_name, media_path, media_type, status FROM events WHERE media_path IS NOT NULL');
        console.table(events.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
