// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  console.log('Auth Debug - Token:', token ? 'Exists' : 'Missing'); // Debug
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('Auth Debug - Decoded:', decoded); // Debug
    
    // Pastikan konsisten menggunakan id (bukan _id)
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = authMiddleware;