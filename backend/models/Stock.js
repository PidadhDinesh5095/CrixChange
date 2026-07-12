import mongoose from 'mongoose'

const stockSchema = new mongoose.Schema({
  title: { type: String, required: true },
  symbol: { type: String, required: true, uppercase: true, unique: true }
}, { timestamps: true })

export default mongoose.model('Stock', stockSchema)
