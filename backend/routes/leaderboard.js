const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET classifica
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM scores ORDER BY total_points DESC, user_name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero della classifica' });
  }
});

module.exports = router;