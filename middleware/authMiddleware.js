const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Tambahkan ini

const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  console.log('Auth Debug - Token:', token ? 'Exists' : 'Missing');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('Auth Debug - Decoded:', decoded);
    
    // Verifikasi user masih ada di database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    
    // Pastikan konsisten menggunakan id
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = authMiddleware;