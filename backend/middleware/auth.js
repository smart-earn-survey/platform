/**
 * Authentication & Authorization Middleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Protect Route (must be logged in) ───────────────────────
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: `Account suspended: ${user.banReason}` });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// ─── Admin Only ───────────────────────────────────────────────
exports.adminOnly = (req, res, next) => {
  if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

// ─── Super Admin Only ─────────────────────────────────────────
exports.superAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Super admin access required.' });
  }
  next();
};

// ─── Verified Email Required ──────────────────────────────────
exports.requireVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address first.',
      requiresVerification: true,
    });
  }
  next();
};

// ─── Track IP ─────────────────────────────────────────────────
exports.trackIP = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    if (req.user && ip && !req.user.ipAddresses.includes(ip)) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { ipAddresses: { $each: [ip], $slice: -20 } },
      });
    }
  } catch (err) {
    // Non-blocking
  }
  next();
};
