import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive']
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  reference: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentMethod: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ reference: 1 });

// Pre-save middleware to generate reference
transactionSchema.pre('save', function(next) {
  if (!this.reference) {
    this.reference = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

// Only deposit and withdrawal transactions are stored

export default mongoose.model('Transaction', transactionSchema);