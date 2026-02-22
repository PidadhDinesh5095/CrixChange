import { stat } from 'fs';
import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  frozenBalance: {
    type: Number,
    default: 0,
    min: [0, 'Frozen balance cannot be negative']
  },
  totalDeposited: {
    type: Number,
    default: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  totalTradeVolume: {
    type: Number,
    default: 0
  },
  totalProfitLoss: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['active', 'frozen', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
walletSchema.index({ userId: 1 });
walletSchema.index({ status: 1 });

// Virtual for available balance
walletSchema.virtual('availableBalance').get(function() {
  return this.balance - this.frozenBalance;
});

// Virtual for total invested
walletSchema.virtual('totalInvested').get(function() {
  return this.totalDeposited - this.totalWithdrawn;
});

// Method to freeze amount
walletSchema.methods.freezeAmount = async function(amount) {
  if (this.availableBalance < amount) {
    throw new Error('Insufficient balance to freeze');
  }
  this.frozenBalance += amount;
  await this.save();
};

// Method to unfreeze amount
walletSchema.methods.unfreezeAmount = async function(amount) {
  if (this.frozenBalance < amount) {
    throw new Error('Insufficient frozen balance to unfreeze');
  }
  this.frozenBalance -= amount;
  await this.save();
};

// Method to debit balance
walletSchema.methods.debit = async function(amount, description = '') {
  if (this.availableBalance < amount) {
    throw new Error('Insufficient balance');
  }
  this.balance -= amount;
  this.totalWithdrawn += amount;
  await this.save();
  
  // Create transaction record
  await mongoose.model('Transaction').create({
    userId: this.userId,
    walletId: this._id,
    type: 'debit',
    amount,
    description,
    status: 'completed',
    paymentMethod: 'Bank Transfer', // Assuming bank transfer for withdrawals, can be modified as needed
    balanceAfter: this.balance
  });
};

// Method to credit balance
walletSchema.methods.credit = async function(amount, paymentMethod, description = '') {
  this.balance += amount;
  console.log('Crediting wallet with amount:', amount); // Debug log
  console.log('New balance after credit:', this.balance); // Debug log
  console.log('totalDeposited before credit:', this.totalDeposited); // Debug log
  this.totalDeposited += amount;
  console.log('totalDeposited after credit:', this.totalDeposited); // Debug log
  await this.save();

  await mongoose.model('Transaction').create({
    userId: this.userId,
    walletId: this._id,
    type: 'credit',
    amount,
    description,
    status: 'completed',
    paymentMethod,
    balanceAfter: this.balance
  });
};

export default mongoose.model('Wallet', walletSchema);