import express from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', asyncHandler(register)); 
router.get('/register',(req,res)=>{res.send("Hello")});
router.post('/login', asyncHandler(login));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.put('/reset-password/:resetToken', asyncHandler(resetPassword));
router.get('/verify-email/:token', asyncHandler(verifyEmail));
router.post('/resend-verification', asyncHandler(resendVerification));
router.post('/refresh-token', asyncHandler(refreshToken));

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post('/logout', asyncHandler(logout));
router.get('/me', asyncHandler(getMe));
router.put('/profile', asyncHandler(updateProfile));
router.put('/change-password', asyncHandler(changePassword));

export default router;