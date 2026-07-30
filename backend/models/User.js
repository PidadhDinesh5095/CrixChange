import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'submitted', 'approved', 'rejected'],
    default: 'pending'
  },
  kycSubmittedAt: Date,
  kycApprovedAt: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  twoFactorSecret: String,
  isTwoFactorEnabled: {
    type: Boolean,
    default: false
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      trades: { type: Boolean, default: true },
      deposits: { type: Boolean, default: true },
      withdrawals: { type: Boolean, default: true },
      kyc: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' }
  },
  lastLogin: Date,
  loginCount: { type: Number, default: 0 },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
userSchema.index({ createdAt: -1 })

// Virtuals
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

userSchema.virtual('wallet', {
  ref: 'Wallet',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
})

// Pre-save: hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Pre-save: generate referral code
userSchema.pre('save', async function (next) {
  if (!this.referralCode) {
    this.referralCode = `CRX${this._id.toString().slice(-6).toUpperCase()}`
  }
  next()
})

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Generate reset token
userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex')
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000
  return resetToken
}

// Check if user can trade
userSchema.methods.canTrade = function () {
  return this.isActive && this.isEmailVerified && this.kycStatus === 'approved'
}

// Get public profile
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    avatar: this.avatar,
    createdAt: this.createdAt
  }
}

export default mongoose.model('User', userSchema)
