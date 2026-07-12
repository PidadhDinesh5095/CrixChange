import mongoose from 'mongoose'

const stockBalanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  total: { type: Number, default: 0 },
  locked: { type: Number, default: 0 }
}, { timestamps: true })

stockBalanceSchema.index({ userId: 1, stockId: 1 }, { unique: true })

export default mongoose.model('StockBalance', stockBalanceSchema)
