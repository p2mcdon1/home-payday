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

// CORS middleware - important to be first in the middleware chain
const allowedOrigins = [
  'http://payroll.home',
  'https://payroll.home'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

const PORT = process.env.PORT || 3001;

// Middleware
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
