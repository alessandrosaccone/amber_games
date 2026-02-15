const pool = require('./config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Changing scores.total_points to NUMERIC...');
        await client.query('ALTER TABLE scores ALTER COLUMN total_points TYPE NUMERIC(10,2)');

        console.log('Changing event_types.points to NUMERIC...');
        await client.query('ALTER TABLE event_types ALTER COLUMN points TYPE NUMERIC(10,2)');

        await client.query('COMMIT');
        console.log('Migration successful!');
        process.exit(0);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
    }
}

migrate();
