const express = require('express');
const router = express.Router();
//const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs'); // Invece di 'bcrypt'
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');

const PASSWORD_HASH = '$2b$10$OYRQ8DAkLZEdXfYZgvdTHu0VNvRJFYP/Z25A7IbNSyDJobAIZElZa';

// Configurazione Multer per avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatarDir = path.join(__dirname, '../../frontend/public/avatars');
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo immagini sono permesse'));
  }
});

// POST - Verifica password
router.post('/login', async (req, res) => {
  const { password } = req.body;
  
  try {
    const match = await bcrypt.compare(password, PASSWORD_HASH);
    
    if (match) {
      res.json({ success: true, message: 'Accesso consentito' });
    } else {
      res.status(401).json({ success: false, message: 'Password errata' });
    }
  } catch (error) {
    console.error('Errore login admin:', error);
    res.status(500).json({ success: false, message: 'Errore server' });
  }
});

// POST - Aggiungi tipo di evento
router.post('/event-types', async (req, res) => {
  const { name, points } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO event_types (name, points) VALUES ($1, $2) RETURNING *',
      [name, points]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore creazione tipo evento:', error);
    res.status(500).json({ error: 'Errore nella creazione del tipo evento' });
  }
});

// DELETE - Elimina tipo di evento
router.delete('/event-types/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM event_types WHERE id = $1', [id]);
    res.json({ success: true, message: 'Tipo evento eliminato' });
  } catch (error) {
    console.error('Errore eliminazione tipo evento:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione' });
  }
});

// POST - Aggiungi persona con avatar
router.post('/people', upload.single('avatar'), async (req, res) => {
  const { name } = req.body;
  let avatarPath = req.file ? req.file.filename : null;
  avatarPath = avatarPath ? `/avatars/${avatarPath}` : null;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Inserisci persona CON avatar_url
    const personResult = await client.query(
      'INSERT INTO predefined_names (name, avatar_url) VALUES ($1, $2) RETURNING *',
      [name, avatarPath]
    );
    
    // Crea score iniziale
    await client.query(
      'INSERT INTO scores (user_name, total_points) VALUES ($1, 0)',
      [name]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json(personResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Errore aggiunta persona:', error);
    res.status(500).json({ error: 'Errore nell\'aggiunta della persona' });
  } finally {
    client.release();
  }
});

// DELETE - Elimina persona
router.delete('/people/:id', async (req, res) => {
  const { id } = req.params;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Ottieni nome persona
    const personResult = await client.query(
      'SELECT name FROM predefined_names WHERE id = $1',
      [id]
    );
    
    if (personResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Persona non trovata' });
    }
    
    const personName = personResult.rows[0].name;
    
    // Elimina persona
    await client.query('DELETE FROM predefined_names WHERE id = $1', [id]);
    
    // Elimina score
    await client.query('DELETE FROM scores WHERE user_name = $1', [personName]);
    
    await client.query('COMMIT');
    
    res.json({ success: true, message: 'Persona eliminata' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Errore eliminazione persona:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione della persona' });
  } finally {
    client.release();
  }
});

// DELETE - Elimina evento specifico
router.delete('/events/:id', async (req, res) => {
  const { id } = req.params;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Elimina verifiche associate
    await client.query('DELETE FROM verifications WHERE event_id = $1', [id]);
    
    // Elimina evento
    await client.query('DELETE FROM events WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    
    res.json({ success: true, message: 'Evento eliminato' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Errore eliminazione evento:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione dell\'evento' });
  } finally {
    client.release();
  }
});

// GET - Lista tutti gli eventi (per admin)
router.get('/events', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, et.name as event_type_name, et.points as event_points
      FROM events e
      JOIN event_types et ON e.event_type_id = et.id
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Errore recupero eventi:', error);
    res.status(500).json({ error: 'Errore nel recupero degli eventi' });
  }
});

// DELETE - Reset completo database
router.delete('/reset-all', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Elimina tutte le verifiche
    await client.query('DELETE FROM verifications');
    
    // Elimina tutti gli eventi
    await client.query('DELETE FROM events');
    
    // Reset tutti i punteggi a 0
    await client.query('UPDATE scores SET total_points = 0, updated_at = CURRENT_TIMESTAMP');
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      message: 'Database resettato: eventi e verifiche eliminate, punteggi azzerati' 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Errore reset database:', error);
    res.status(500).json({ error: 'Errore nel reset del database' });
  } finally {
    client.release();
  }
});

// GET - Lista persone (per admin)
router.get('/people', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM predefined_names ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Errore recupero persone:', error);
    res.status(500).json({ error: 'Errore nel recupero delle persone' });
  }
});

module.exports = router;