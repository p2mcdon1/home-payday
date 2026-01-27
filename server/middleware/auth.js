const { expressjwt: jwt } = require('express-jwt');
const db = require('../db');
const userQueries = require('../db/queries/users');

// JWT middleware - automatically extracts and verifies token
const authenticateToken = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'auth', // Store decoded token in req.auth
}).unless({
  path: ['/api/auth/login', '/api/auth/register', '/api/health']
});

// Middleware to load user from database after JWT verification
const loadUser = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Load user from database
    const result = await db.query(
      userQueries.findUserById,
      [req.auth.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or account is disabled' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Error loading user:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Error handler for JWT errors
const handleJWTError = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  next(err);
};

// Require admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  loadUser,
  requireAdmin,
  handleJWTError,
};
