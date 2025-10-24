import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const JWT_SECRET='crix';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Admin access control
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as admin'
    });
  }
};

// KYC verification check
export const requireKYC = (req, res, next) => {
  if (req.user && req.user.kycStatus === 'approved') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'KYC verification required for this action',
      kycStatus: req.user.kycStatus
    });
  }
};

// Email verification check
export const requireEmailVerification = (req, res, next) => {
  if (req.user && req.user.isEmailVerified) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Email verification required'
    });
  }
};

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn:  '7d'
  });
};

// Generate refresh token
export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn:  '30d'
  });
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};