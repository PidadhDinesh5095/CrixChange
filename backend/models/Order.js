import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  orderType: {
    type: String,
    enum: ['market', 'limit', 'stop'],
    default: 'market'
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  limitPrice: {
    type: Number,
    sparse: true
  },
  stopPrice: {
    type: Number,
    sparse: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  filledQuantity: {
    type: Number,
    default: 0
  },
  filledAmount: {
    type: Number,
    default: 0
  },
  averagePrice: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ teamId: 1, type: 1, status: 1 });
orderSchema.index({ status: 1, expiresAt: 1 });
orderSchema.index({ type: 1, orderType: 1, price: 1 });

// Virtual for remaining quantity
orderSchema.virtual('remainingQuantity').get(function() {
  return this.quantity - this.filledQuantity;
});

// Virtual for fill percentage
orderSchema.virtual('fillPercentage').get(function() {
  return (this.filledQuantity / this.quantity) * 100;
});

// Method to partially fill order
orderSchema.methods.partialFill = async function(quantity, price) {
  if (quantity > this.remainingQuantity) {
    throw new Error('Fill quantity exceeds remaining quantity');
  }
  
  const fillAmount = quantity * price;
  this.filledQuantity += quantity;
  this.filledAmount += fillAmount;
  this.averagePrice = this.filledAmount / this.filledQuantity;
  
  if (this.filledQuantity === this.quantity) {
    this.status = 'completed';
  } else {
    this.status = 'partial';
  }
  
  await this.save();
  
  // Create fill record
  await mongoose.model('OrderFill').create({
    orderId: this._id,
    userId: this.userId,
    teamId: this.teamId,
    quantity,
    price,
    amount: fillAmount
  });
};

// Method to cancel order
orderSchema.methods.cancel = async function(reason = 'User cancelled') {
  if (this.status === 'completed') {
    throw new Error('Cannot cancel completed order');
  }
  
  this.status = 'cancelled';
  this.rejectionReason = reason;
  await this.save();
};

// Static method to get order book
orderSchema.statics.getOrderBook = async function(teamId, limit = 10) {
  const buyOrders = await this.find({
    teamId,
    type: 'buy',
    status: { $in: ['pending', 'partial'] }
  })
  .sort({ price: -1, createdAt: 1 })
  .limit(limit)
  .populate('userId', 'firstName lastName');
  
  const sellOrders = await this.find({
    teamId,
    type: 'sell',
    status: { $in: ['pending', 'partial'] }
  })
  .sort({ price: 1, createdAt: 1 })
  .limit(limit)
  .populate('userId', 'firstName lastName');
  
  return { buyOrders, sellOrders };
};

// Static method to match orders
orderSchema.statics.matchOrders = async function(teamId) {
  const buyOrders = await this.find({
    teamId,
    type: 'buy',
    status: { $in: ['pending', 'partial'] }
  }).sort({ price: -1, createdAt: 1 });
  
  const sellOrders = await this.find({
    teamId,
    type: 'sell',
    status: { $in: ['pending', 'partial'] }
  }).sort({ price: 1, createdAt: 1 });
  
  const matches = [];
  
  for (const buyOrder of buyOrders) {
    for (const sellOrder of sellOrders) {
      if (buyOrder.price >= sellOrder.price) {
        const matchQuantity = Math.min(buyOrder.remainingQuantity, sellOrder.remainingQuantity);
        const matchPrice = sellOrder.price; // Price discovery
        
        matches.push({
          buyOrder,
          sellOrder,
          quantity: matchQuantity,
          price: matchPrice
        });
        
        if (buyOrder.remainingQuantity === 0) break;
      }
    }
  }
  
  return matches;
};

export default mongoose.model('Order', orderSchema);