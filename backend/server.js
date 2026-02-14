const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();


const pool = require('./config/db');
const eventsRouter = require('./routes/events');
const verificationsRouter = require('./routes/verifications');
const leaderboardRouter = require('./routes/leaderboard');
const adminRouter = require('./routes/admin'); 
const { startKeepAliveJob } = require('./jobs/keepAlive'); 


const app = express();
const PORT = process.env.PORT || 5000;

// Funzione per inizializzare il DB se vuoto (utile per Render Free senza Shell)
async function initDatabase() {
  try {
    const res = await pool.query("SELECT to_regclass('public.predefined_names')");
    if (!res.rows[0].to_regclass) {
      console.log('Database tables not found. Initializing...');
      const sqlPath = path.join(__dirname, 'models/init.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');

      const cleanSql = sql.replace(/--.*$/gm, '');
      const statements = cleanSql.split(';').map(s => s.trim()).filter(s => s.length > 0);

      for (const statement of statements) {
        await pool.query(statement);
      }
      console.log('Database initialized successfully!');
    } else {
      console.log('Database already initialized.');
    }
  } catch (err) {
    console.error('Error during DB initialization:', err);
  }
}

// Middleware
const corsOptions = {
  origin: '*', // Per debug su Render, poi restringere se necessario
  credentials: true
};
app.use(cors(corsOptions)); 
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API Routes
app.use('/api/events', eventsRouter);
app.use('/api/verifications', verificationsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/admin', adminRouter); 

// Root route per Health Check e Debug
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Amber Games API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

  
// Catch-all route for SPA: any request that doesn't match an API route
// should return the React app's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Avvio server dopo check DB
initDatabase().then(() => {
  startKeepAliveJob(); // ⭐ AGGIUNGI QUESTA RIGA

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});