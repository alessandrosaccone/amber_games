const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST verifica evento
router.post('/', async (req, res) => {
  const { event_id, verifier_name, verification_type } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Controlla che l'evento esista ed sia pending
    const eventResult = await client.query(
      'SELECT * FROM events WHERE id = $1 AND status = $2',
      [event_id, 'pending']
    );
    
    if (eventResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Evento non trovato o già processato' });
    }
    
    const event = eventResult.rows[0];
    
    // Controlla che il verificatore non sia il dichiarante
    if (verifier_name === event.declarer_name) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Non puoi verificare il tuo stesso evento' });
    }
    
    // Controlla che il verificatore non abbia già verificato
    const existingVerification = await client.query(
      'SELECT * FROM verifications WHERE event_id = $1 AND verifier_name = $2',
      [event_id, verifier_name]
    );
    
    if (existingVerification.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Hai già verificato questo evento' });
    }
    
    // Inserisci la verifica
    await client.query(
      'INSERT INTO verifications (event_id, verifier_name, verification_type) VALUES ($1, $2, $3)',
      [event_id, verifier_name, verification_type]
    );
    
    // AGGIUNGI 2 PUNTI AL VERIFICATORE (indipendentemente da conferma o rifiuto)
    await client.query(
      'UPDATE scores SET total_points = total_points + 2, updated_at = CURRENT_TIMESTAMP WHERE user_name = $1',
      [verifier_name]
    );
    
    // Aggiorna il contatore
    if (verification_type === 'confirm') {
      await client.query(
        'UPDATE events SET confirmations = confirmations + 1 WHERE id = $1',
        [event_id]
      );
    } else {
      await client.query(
        'UPDATE events SET rejections = rejections + 1 WHERE id = $1',
        [event_id]
      );
    }
    
    // Recupera l'evento aggiornato
    const updatedEvent = await client.query(
      'SELECT * FROM events WHERE id = $1',
      [event_id]
    );
    
    const evt = updatedEvent.rows[0];
    
    // Controlla se abbiamo raggiunto 3 conferme o 3 rifiuti
    if (evt.confirmations >= 3) {
      // Evento confermato
      await client.query(
        'UPDATE events SET status = $1 WHERE id = $2',
        ['confirmed', event_id]
      );
      
      // Ottieni i punti dell'evento
      const eventTypeResult = await client.query(
        'SELECT points FROM event_types WHERE id = $1',
        [evt.event_type_id]
      );
      const eventPoints = eventTypeResult.rows[0].points;
      
      // Aggiungi punti alla persona dell'evento
      await client.query(
        'UPDATE scores SET total_points = total_points + $1, updated_at = CURRENT_TIMESTAMP WHERE user_name = $2',
        [eventPoints, evt.person_name]
      );
      
      // Aggiungi 5 punti al dichiarante
      await client.query(
        'UPDATE scores SET total_points = total_points + 5, updated_at = CURRENT_TIMESTAMP WHERE user_name = $1',
        [evt.declarer_name]
      );
      
      await client.query('COMMIT');
      return res.json({ 
        message: 'Evento confermato!', 
        status: 'confirmed',
        points_awarded: {
          [evt.person_name]: eventPoints,
          [evt.declarer_name]: 5,
          [verifier_name]: 2
        }
      });
      
    } else if (evt.rejections >= 3) {
      // Evento rifiutato
      await client.query(
        'UPDATE events SET status = $1 WHERE id = $2',
        ['rejected', event_id]
      );
      
      await client.query('COMMIT');
      return res.json({ 
        message: 'Evento rifiutato', 
        status: 'rejected',
        points_awarded: {
          [verifier_name]: 2
        }
      });
      
    } else {
      await client.query('COMMIT');
      return res.json({ 
        message: 'Verifica registrata', 
        status: 'pending',
        confirmations: evt.confirmations,
        rejections: evt.rejections,
        points_awarded: {
          [verifier_name]: 2
        }
      });
    }
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Errore nella verifica dell\'evento' });
  } finally {
    client.release();
  }
});

// GET verifiche per un evento
router.get('/:event_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM verifications WHERE event_id = $1 ORDER BY verified_at DESC',
      [req.params.event_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel recupero delle verifiche' });
  }
});

module.exports = router;