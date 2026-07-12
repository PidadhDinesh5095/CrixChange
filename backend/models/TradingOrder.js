import mongoose from 'mongoose'

const tradingOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  side: { type: String, enum: ['BUY', 'SELL'], required: true },
  type: { type: String, enum: ['MARKET', 'LIMIT'], required: true },
  price: { type: Number, default: null },
  qty: { type: Number, required: true },
  filledQty: { type: Number, default: 0 },
  status: { type: String, enum: ['OPEN','PARTIALLY_FILLED','FILLED','CANCELLED'], default: 'OPEN' }
}, { timestamps: true })

tradingOrderSchema.index({ stockId: 1, side: 1, status: 1, price: 1 })

export default mongoose.model('TradingOrder', tradingOrderSchema)
