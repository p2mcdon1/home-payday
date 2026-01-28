// Load environment variables FIRST before any other requires
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/auth');
const adultRoutes = require('./routes/adult');
const kidRoutes = require('./routes/kid');
const { authenticateToken, loadUser, requireAdult, handleJWTError } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// JWT authentication middleware (applied to all routes except excluded ones)
app.use(authenticateToken);

// JWT error handler
app.use(handleJWTError);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/adult', loadUser, requireAdult, adultRoutes);
app.use('/api/kid', loadUser, kidRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Initialize database and start server
db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
