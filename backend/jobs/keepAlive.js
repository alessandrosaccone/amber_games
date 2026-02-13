const pool = require('../config/db');

const keepDatabaseAlive = async () => {
  try {
    await pool.query('SELECT 1');
    console.log(`[${new Date().toISOString()}] Database keep-alive ping successful`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Database keep-alive ping failed:`, error.message);
  }
};

const startKeepAliveJob = () => {
  // 10 minuti = 600000 millisecondi
  setInterval(keepDatabaseAlive, 10 * 60 * 1000);
  
  console.log('Keep-alive job started: runs every 10 minutes');
  
  // Esegui subito una volta all'avvio
  keepDatabaseAlive();
};

module.exports = { startKeepAliveJob };