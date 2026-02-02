import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative']
  },
  averageBuyPrice: {
    type: Number,
    required: true,
    min: [0, 'Average buy price cannot be negative']
  },
  totalInvested: {
    type: Number,
    required: true,
    min: [0, 'Total invested cannot be negative']
  },
  currentValue: {
    type: Number,
    default: 0
  },
  unrealizedPnL: {
    type: Number,
    default: 0
  },
  realizedPnL: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure unique user-team combination
portfolioSchema.index({ userId: 1, teamId: 1 }, { unique: true });
portfolioSchema.index({ userId: 1 });

// Virtual for total PnL
portfolioSchema.virtual('totalPnL').get(function() {
  return this.realizedPnL + this.unrealizedPnL;
});

// Virtual for PnL percentage
portfolioSchema.virtual('pnlPercentage').get(function() {
  if (this.totalInvested === 0) return 0;
  return (this.totalPnL / this.totalInvested) * 100;
});

// Method to update current value and unrealized PnL
portfolioSchema.methods.updateCurrentValue = async function(currentPrice) {
  this.currentValue = this.quantity * currentPrice;
  this.unrealizedPnL = this.currentValue - this.totalInvested;
  this.lastUpdated = new Date();
  await this.save();
};

// Method to add shares (buy)
portfolioSchema.methods.addShares = async function(quantity, price) {
  const newInvestment = quantity * price;
  const newTotalQuantity = this.quantity + quantity;
  
  // Calculate new average buy price
  this.averageBuyPrice = (this.totalInvested + newInvestment) / newTotalQuantity;
  this.quantity = newTotalQuantity;
  this.totalInvested += newInvestment;
  
  await this.save();
};

// Method to sell shares
portfolioSchema.methods.sellShares = async function(quantity, price) {
  if (quantity > this.quantity) {
    throw new Error('Insufficient shares to sell');
  }
  
  const saleValue = quantity * price;
  const costBasis = quantity * this.averageBuyPrice;
  const realizedGainLoss = saleValue - costBasis;
  
  this.quantity -= quantity;
  this.totalInvested -= costBasis;
  this.realizedPnL += realizedGainLoss;
  
  if (this.quantity === 0) {
    // If all shares sold, reset values
    this.averageBuyPrice = 0;
    this.totalInvested = 0;
    this.currentValue = 0;
    this.unrealizedPnL = 0;
  }
  
  await this.save();
  return realizedGainLoss;
};

// Static method to get user's complete portfolio
portfolioSchema.statics.getUserPortfolio = async function(userId) {
  return await this.find({ userId, quantity: { $gt: 0 } })
    .populate('teamId', 'name shortName logo currentPrice sport league')
    .sort({ totalInvested: -1 });
};

// Static method to get portfolio summary
portfolioSchema.statics.getPortfolioSummary = async function(userId) {
  const pipeline = [
    { $match: { userId: mongoose.Types.ObjectId(userId), quantity: { $gt: 0 } } },
    {
      $group: {
        _id: null,
        totalInvested: { $sum: '$totalInvested' },
        totalCurrentValue: { $sum: '$currentValue' },
        totalRealizedPnL: { $sum: '$realizedPnL' },
        totalUnrealizedPnL: { $sum: '$unrealizedPnL' },
        totalHoldings: { $sum: 1 }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalInvested: 0,
    totalCurrentValue: 0,
    totalRealizedPnL: 0,
    totalUnrealizedPnL: 0,
    totalHoldings: 0
  };
};

export default mongoose.model('Portfolio', portfolioSchema);