import crypto from 'crypto';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Blacklist from '../models/Blacklist.js'; // import Blacklist model
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth.js';

import { validateRegister, validateLogin } from '../utils/validation.js';
import { sendWelcomeEmail, sendVerificationEmail ,sendPasswordChangedEmail,sendPasswordResetEmail,sendEmailVerificationSuccessEmail} from '../utils/sendEmail.js';
import dotenv from 'dotenv';
dotenv.config();

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  // Clean up phone number (remove spaces, dashes, country code for storage)
  console.log("Reached here at the start of register", req.body);
  if (req.body.phone) {
    req.body.phone = req.body.phone.replace(/[^0-9]/g, '');
    // Optionally, remove country code if present
    if (req.body.phone.startsWith('91') && req.body.phone.length > 10) {
      req.body.phone = req.body.phone.slice(-10);
    }
  }

  // Remove confirmPassword from req.body before validation
  if ('confirmPassword' in req.body) {
    delete req.body.confirmPassword;
  }

  const { error } = validateRegister(req.body);
  if (error) {
    console.log("Validation error:", error.details[0].message);
    return res.status(400).json({
      success: false,
      message: "this is the error" + error.details[0].message
    });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    dateOfBirth,
    gender
  } = req.body;


  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    console.log("User already exists with email or phone");
    return res.status(400).json({

      success: false,
      message: existingUser.email === email ? 'Email already registered' : 'Phone number already registered'
    });
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    dateOfBirth,
    gender
  });

  // Create wallet for user
  await Wallet.create({
    userId: user._id
  });

  // Generate email verification token
  console.log("Generating email verification token");
  const verificationToken = crypto.randomBytes(20).toString('hex');
  user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;
 

  
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  console.log("User registered successfully");

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email for verification link.',
    data: {
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        kycStatus: user.kycStatus,
        role: user.role
      }
    }
  });
  try {
    
    await sendWelcomeEmail(user.email,user.firstName);
    console.log("Welcome email sent successfully");
    await sendVerificationEmail(user.email,user.firstName, verificationUrl);
  } catch (error) {
    console.error('Email sending failed:', error);
    // Don't fail registration if email fails
  }

};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  const { email, password } = req.body;

  // Check for user (include password for comparison)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account has been deactivated'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  user.loginCount += 1;
  await user.save();

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  console.log("User logged in successfully");

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        kycStatus: user.kycStatus,
        role: user.role,
        preferences: user.preferences
      }
    }
  });
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  // Blacklist the token
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      await Blacklist.create({ token });
    }
  }
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
  console.log("User logged out successfully");
};

export const getMe = async (req, res) => {
  if (await isTokenBlacklisted(req)) {
    return res.status(401).json({ success: false, message: 'Token expired or blacklisted' });
  }
  const user = await User.findById(req.user.id)
    .populate('wallet')
    .select('-password');

  res.json({
    success: true,
    data: { user }
  });
};

export const updateProfile = async (req, res) => {
  if (await isTokenBlacklisted(req)) {
    return res.status(401).json({ success: false, message: 'Token expired or blacklisted' });
  }
  const { firstName, lastName, phone, preferences } = req.body;

  const user = await User.findById(req.user.id);

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone && phone !== user.phone) {
    // Check if phone is already taken
    const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already in use'
      });
    }
    user.phone = phone;
    user.isPhoneVerified = false; // Reset phone verification if changed
  }
  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences };
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  if (await isTokenBlacklisted(req)) {
    return res.status(401).json({ success: false, message: 'Token expired or blacklisted' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current and new password'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters'
    });
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();
const changePasswordUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/profile`;

 

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
   try {
    await sendPasswordChangedEmail(user.email, changePasswordUrl);

   
  } catch (error) {
    

   console.log('Password change email sending failed:', error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email address'
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No user found with this email address'
    });
  }

  // Generate reset token
  const resetToken = user.generateResetToken();
  await user.save();

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

 

  try {
    

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
    await sendPasswordResetEmail(user.email,user.firstName, resetUrl);
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide new password'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters'
    });
  }

  // Get hashed token
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Password reset successful',
    data: { token }
  });
    try {
    const changePasswordUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/profile`;
    await sendPasswordChangedEmail(user.email, changePasswordUrl);
  } catch (error) {
    console.error('Password changed email sending failed:', error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  console.log("Verifying email with hashedtoken:", hashedToken);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired  token'
    });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  // Send KYC completion email
  const kycUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/kyc`;
 

  res.json({
    success: true,
    message: 'Email verified successfullyy'
  });
  try {
    await sendEmailVerificationSuccessEmail(user.email, kycUrl);
  } catch (error) {
    console.error('KYC email sending failed:', error);

  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email address'
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No user found with this email address'
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;
 

  try {
   

    res.json({
      success: true,
      message: 'Verification email sent'
    });
     await sendVerificationEmail(user.email, verificationUrl);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Helper to check if token is blacklisted
const isTokenBlacklisted = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  const token = authHeader.split(' ')[1];
  if (!token) return false;
  const found = await Blacklist.findOne({ token });
  return !!found;
};