const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const eventsRouter = require('./routes/events');
const verificationsRouter = require('./routes/verifications');
const leaderboardRouter = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/events', eventsRouter);
app.use('/api/verifications', verificationsRouter);
app.use('/api/leaderboard', leaderboardRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Event Verification API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});