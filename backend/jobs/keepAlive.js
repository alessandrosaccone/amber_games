const pool = require('../config/db');
const https = require('https');
const http = require('http');

const keepDatabaseAlive = async () => {
  try {
    await pool.query('SELECT 1');
    console.log(`[${new Date().toISOString()}] Database keep-alive ping successful`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Database keep-alive ping failed:`, error.message);
  }
};

const keepWebAlive = (url) => {
  if (!url) return;

  const protocol = url.startsWith('https') ? https : http;

  protocol.get(url, (res) => {
    console.log(`[${new Date().toISOString()}] Web keep-alive ping to ${url} - Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Web keep-alive ping failed:`, err.message);
  });
};

const startKeepAliveJob = () => {
  const publicUrl = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL;

  // 10 minuti = 600000 millisecondi
  setInterval(() => {
    keepDatabaseAlive();
    if (publicUrl) keepWebAlive(publicUrl + '/api/health');
  }, 10 * 60 * 1000);

  console.log('Keep-alive job started: runs every 10 minutes');
  if (publicUrl) console.log(`Self-ping configured for: ${publicUrl}`);

  // Esegui subito una volta all'avvio
  keepDatabaseAlive();
  if (publicUrl) keepWebAlive(publicUrl + '/api/health');
};

module.exports = { startKeepAliveJob };