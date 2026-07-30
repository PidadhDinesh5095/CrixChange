import mongoose from 'mongoose'

const fillSchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  buyOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  sellOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true })

export default mongoose.model('Fill', fillSchema)
