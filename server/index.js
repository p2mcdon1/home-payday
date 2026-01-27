const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const { authenticateToken, loadUser, requireAdmin, handleJWTError } = require('./middleware/auth');

dotenv.config();

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
app.use('/api/admin', loadUser, requireAdmin, adminRoutes);
app.use('/api/user', loadUser, userRoutes);

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
