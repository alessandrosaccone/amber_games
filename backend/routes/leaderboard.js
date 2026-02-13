const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET classifica
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, pn.avatar_url 
      FROM scores s
      LEFT JOIN predefined_names pn ON s.user_name = pn.name
      ORDER BY s.total_points DESC, s.user_name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero della classifica' });
  }
});

module.exports = router;