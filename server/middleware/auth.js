import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Authentication middleware that verifies JWT and attaches user to req
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid'
      });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'devpulse_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, jwtSecret);

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // In-memory or fallback user
    if (req.app.locals.currentUser && (req.app.locals.currentUser._id?.toString() === decoded.id || req.app.locals.currentUser.id === decoded.id || req.app.locals.currentUser.email === decoded.email)) {
      req.user = req.app.locals.currentUser;
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'User session not found or expired'
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: err.message
    });
  }
};

/**
 * Optional authentication middleware - attaches user if valid token present
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET || 'devpulse_super_secret_jwt_key_2026';
      const decoded = jwt.verify(token, jwtSecret);

      if (mongoose.connection.readyState === 1) {
        const user = await User.findById(decoded.id);
        if (user) req.user = user;
      } else if (req.app.locals.currentUser) {
        req.user = req.app.locals.currentUser;
      }
    }
  } catch (err) {
    // Ignore invalid optional tokens
  }
  next();
};
