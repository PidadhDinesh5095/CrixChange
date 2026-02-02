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
    enum: ['credit', 'debit', 'deposit', 'withdrawal', 'trade_buy', 'trade_sell', 'refund', 'fee'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive']
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  reference: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentId: {
    type: String,
    sparse: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    sparse: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ refrence: 1 });
transactionSchema.index({ paymentId: 1 });

// Pre-save middleware to generate reference
transactionSchema.pre('save', function(next) {
  if (!this.reference) {
    this.reference = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

// Static method to get user transaction summary
transactionSchema.statics.getUserSummary = async function(userId, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: startDate || new Date(0),
          $lte: endDate || new Date()
        },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

export default mongoose.model('Transaction', transactionSchema);