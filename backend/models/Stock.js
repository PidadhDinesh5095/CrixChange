import mongoose from 'mongoose'

const stockSchema = new mongoose.Schema({
  title: { type: String, required: true },
  symbol: { type: String, required: true, uppercase: true, unique: true },
  image: { type: String, required: true, unique: true },
  price: { type: Number, required: true, default: 0 },
  high: { type: Number, required: true, default: 0 },
  low: { type: Number, required: true, default: 0 },
  volume: { type: Number, required: true, default: 0 },
  lastPrice: { type: Number, required: true, default: 0 },
  change:{ type: Number, required: true, default: 0 },
  changePercent:{ type: Number, required: true, default: 0 },
}, { timestamps: true })

export default mongoose.model('Stock', stockSchema)