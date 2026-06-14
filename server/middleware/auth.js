const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — verify JWT from HttpOnly cookie
const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Access denied: Admin only' });
};

// Agent only middleware
const agentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'agent') return next();
  return res.status(403).json({ success: false, message: 'Access denied: Agent only' });
};

module.exports = { protect, adminOnly, agentOnly };
