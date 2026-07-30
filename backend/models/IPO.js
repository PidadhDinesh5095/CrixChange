import mongoose from 'mongoose';

const ipoSchema = new mongoose.Schema({
  stockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  teamName: {
    type: String,
    required: true,
    trim: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  teamLogo: {
    type: String,
    default: ''
  },
  ipoPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalShares: {
    type: Number,
    required: true,
    min: 1
  },
  availableShares: {
    type: Number,
    required: true,
    min: 0
  },
  lockedShares : {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['UPCOMING', 'OPEN', 'CLOSED', 'LISTED'],
    default: 'UPCOMING'
  },
  openTime: {
    type: Date,
    required: true
  },
  closeTime: {
    type: Date,
    required: true
  },
  listedTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('IPO', ipoSchema);
