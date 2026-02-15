const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');

const fs = require('fs');

// Configurazione Multer per upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limite
});

// GET tutti i nomi predefiniti
router.get('/names', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM predefined_names ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero dei nomi' });
  }
});

// GET tutti i tipi di evento
router.get('/types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM event_types ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero dei tipi di evento' });
  }
});

// GET tutti gli eventi pending
router.get('/pending', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, 
             et.name as event_type_name, 
             et.points as event_points,
             pn1.avatar_url as person_avatar,
             pn2.avatar_url as declarer_avatar
      FROM events e
      JOIN event_types et ON e.event_type_id = et.id
      LEFT JOIN predefined_names pn1 ON e.person_name = pn1.name
      LEFT JOIN predefined_names pn2 ON e.declarer_name = pn2.name
      WHERE e.status = 'pending'
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero degli eventi' });
  }
});

// POST nuovo evento
router.post('/', upload.single('media'), async (req, res) => {
  const { person_name, event_type_id, declarer_name, description } = req.body;

  try {
    let mediaPath = null;
    let mediaType = null;

    if (req.file) {
      mediaPath = req.file.filename;
      const ext = path.extname(req.file.originalname).toLowerCase();

      if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        mediaType = 'photo';
      } else if (['.mp4', '.avi', '.mov'].includes(ext)) {
        mediaType = 'video';
      } else if (['.mp3', '.wav', '.ogg'].includes(ext)) {
        mediaType = 'audio';
      }
    }

    const result = await pool.query(
      `INSERT INTO events (person_name, event_type_id, declarer_name, description, media_path, media_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [person_name, event_type_id, declarer_name, description, mediaPath, mediaType]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nella creazione dell\'evento' });
  }
});

// GET eventi confermati per un utente specifico
router.get('/user/:userName', async (req, res) => {
  const { userName } = req.params;

  try {
    const result = await pool.query(`
      SELECT e.*, 
             et.name as event_type_name, 
             et.points as event_points,
             pn1.avatar_url as person_avatar,
             pn2.avatar_url as declarer_avatar
      FROM events e
      JOIN event_types et ON e.event_type_id = et.id
      LEFT JOIN predefined_names pn1 ON e.person_name = pn1.name
      LEFT JOIN predefined_names pn2 ON e.declarer_name = pn2.name
      WHERE e.person_name = $1 AND e.status = 'confirmed'
      ORDER BY e.created_at DESC
    `, [userName]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero degli eventi dell\'utente' });
  }
});

// GET evento singolo
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, 
             et.name as event_type_name, 
             et.points as event_points,
             pn1.avatar_url as person_avatar,
             pn2.avatar_url as declarer_avatar
      FROM events e
      JOIN event_types et ON e.event_type_id = et.id
      LEFT JOIN predefined_names pn1 ON e.person_name = pn1.name
      LEFT JOIN predefined_names pn2 ON e.declarer_name = pn2.name
      WHERE e.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento non trovato' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero dell\'evento' });
  }
});

module.exports = router;