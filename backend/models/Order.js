import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  side: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  orderType: {
    type: String,
    enum: ['MARKET', 'LIMIT'],
    default: 'MARKET'
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
  type: Number,
  required: function () {
    return this.orderType === "LIMIT";
  },
  min: [0, "Price cannot be negative"]
},
averagePrice: {
  type: Number,
  required: function () {
    return this.orderType === "MARKET";
  },
  min: [0, "Average price cannot be negative"]
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
    enum: ['OPEN', 'PARTIALLY_FILLED', 'CLOSED', 'CANCELLED', 'REJECTED'],
    default: 'OPEN'
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
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
orderSchema.index({ stockId: 1, type: 1, status: 1 });
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
  await mongoose.model('Fill').create({
    orderId: this._id,
    userId: this.userId,
    stockId: this.stockId,
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
orderSchema.statics.getOrderBook = async function(stockId, limit = 10) {
  const buyOrders = await this.find({
    stockId,
    type: 'buy',
    status: { $in: ['pending', 'partial'] }
  })
  .sort({ price: -1, createdAt: 1 })
  .limit(limit)
  .populate('userId', 'firstName lastName');
  
  const sellOrders = await this.find({
    stockId,
    type: 'sell',
    status: { $in: ['pending', 'partial'] }
  })
  .sort({ price: 1, createdAt: 1 })
  .limit(limit)
  .populate('userId', 'firstName lastName');
  
  return { buyOrders, sellOrders };
};

// Static method to match orders
orderSchema.statics.matchOrders = async function(stockId) {
  const buyOrders = await this.find({
    stockId,
    type: 'buy',
    status: { $in: ['pending', 'partial'] }
  }).sort({ price: -1, createdAt: 1 });
  
  const sellOrders = await this.find({
    stockId,
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