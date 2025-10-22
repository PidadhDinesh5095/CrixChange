import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  shortName: {
    type: String,
    required: [true, 'Team short name is required'],
    trim: true,
    maxlength: [10, 'Short name cannot exceed 10 characters']
  },
  logo: {
    type: String,
    default: null
  },
  sport: {
    type: String,
    enum: ['cricket', 'football', 'basketball', 'tennis'],
    required: true
  },
  league: {
    type: String,
    required: [true, 'League is required']
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  },
  
  // Stock Information
  currentPrice: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
    default: 100
  },
  openingPrice: {
    type: Number,
    required: true,
    default: 100
  },
  dayHigh: {
    type: Number,
    required: true,
    default: 100
  },
  dayLow: {
    type: Number,
    required: true,
    default: 100
  },
  weekHigh: {
    type: Number,
    default: 100
  },
  weekLow: {
    type: Number,
    default: 100
  },
  
  // Trading Information
  totalShares: {
    type: Number,
    default: 1000000
  },
  availableShares: {
    type: Number,
    default: 1000000
  },
  marketCap: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    default: 0
  },
  
  // Performance Metrics
  performance: {
    today: {
      type: Number,
      default: 0
    },
    week: {
      type: Number,
      default: 0
    },
    month: {
      type: Number,
      default: 0
    },
    year: {
      type: Number,
      default: 0
    }
  },
  
  // Team Statistics
  stats: {
    matchesPlayed: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    losses: {
      type: Number,
      default: 0
    },
    draws: {
      type: Number,
      default: 0
    },
    winPercentage: {
      type: Number,
      default: 0
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isTradingEnabled: {
    type: Boolean,
    default: true
  },
  
  // External IDs
  externalId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Price factors configuration
  priceFactors: {
    winMultiplier: {
      type: Number,
      default: 1.1
    },
    lossMultiplier: {
      type: Number,
      default: 0.9
    },
    performanceWeight: {
      type: Number,
      default: 0.3
    },
    volumeWeight: {
      type: Number,
      default: 0.2
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
teamSchema.index({ sport: 1, league: 1 });
teamSchema.index({ isActive: 1, isTradingEnabled: 1 });
teamSchema.index({ currentPrice: 1 });
teamSchema.index({ volume: -1 });

// Virtual for price change
teamSchema.virtual('priceChange').get(function() {
  return this.currentPrice - this.openingPrice;
});

// Virtual for price change percentage
teamSchema.virtual('priceChangePercent').get(function() {
  if (this.openingPrice === 0) return 0;
  return ((this.currentPrice - this.openingPrice) / this.openingPrice) * 100;
});

// Method to update price
teamSchema.methods.updatePrice = async function(newPrice, volume = 0) {
  // Update price history
  this.currentPrice = newPrice;
  this.dayHigh = Math.max(this.dayHigh, newPrice);
  this.dayLow = Math.min(this.dayLow, newPrice);
  this.volume += volume;
  this.marketCap = this.currentPrice * (this.totalShares - this.availableShares);
  
  // Calculate performance
  this.performance.today = ((this.currentPrice - this.openingPrice) / this.openingPrice) * 100;
  
  await this.save();
  
  // Save price history
  await mongoose.model('PriceHistory').create({
    teamId: this._id,
    price: newPrice,
    volume: volume,
    timestamp: new Date()
  });
};

// Method to reset daily stats
teamSchema.methods.resetDailyStats = async function() {
  this.openingPrice = this.currentPrice;
  this.dayHigh = this.currentPrice;
  this.dayLow = this.currentPrice;
  this.volume = 0;
  this.performance.today = 0;
  await this.save();
};

// Static method to get top performers
teamSchema.statics.getTopPerformers = async function(limit = 10, period = 'today') {
  const sortField = `performance.${period}`;
  return await this.find({ isActive: true, isTradingEnabled: true })
    .sort({ [sortField]: -1 })
    .limit(limit);
};

// Static method to get market movers
teamSchema.statics.getMarketMovers = async function() {
  return {
    gainers: await this.find({ isActive: true, isTradingEnabled: true })
      .sort({ 'performance.today': -1 })
      .limit(5),
    losers: await this.find({ isActive: true, isTradingEnabled: true })
      .sort({ 'performance.today': 1 })
      .limit(5),
    mostActive: await this.find({ isActive: true, isTradingEnabled: true })
      .sort({ volume: -1 })
      .limit(5)
  };
};

export default mongoose.model('Team', teamSchema);