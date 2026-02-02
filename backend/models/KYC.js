import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Personal Information
  fullName: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  motherName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'], required: true },
  // Address
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true, match: /^[0-9]{6}$/ },
    country: { type: String, required: true, default: 'India' }
  },
  // Documents
  documents: {
    aadhaar: {
      number: { type: String, required: true, match: /^[0-9]{12}$/ },
      frontImage: { type: String, required: false },
      backImage: { type: String, required: false }
    },
    pan: {
      number: { type: String, required: true, match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ },
      image: { type: String, required: false }
    },
    selfie: { type: String, required: false },
    bankStatement: { type: String }
  },
  // Bank Account
  bankAccount: {
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true, match: /^[A-Z]{4}0[A-Z0-9]{6}$/ },
    bankName: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    accountType: { type: String, enum: ['savings', 'current'], required: true }
  },
  // Employment
  employment: {
    status: { type: String, enum: ['employed', 'self-employed', 'student', 'unemployed', 'retired'], required: true },
    company: { type: String },
    designation: { type: String },
    annualIncome: { type: Number, required: true, min: 0 },
    incomeSource: { type: String, enum: ['salary', 'business', 'investment', 'other'], required: true }
  },
  // Trading Experience
  tradingExperience: {
    hasTraded: { type: Boolean, required: true },
    experience: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    riskTolerance: { type: String, enum: ['low', 'medium', 'high'], required: true }
  },
  // Status and Verification
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'resubmission_required'],
    default: 'draft'
  },
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String, maxlength: 1000 },
  approvalDate: { type: Date },
  verificationScores: {
    documentScore: { type: Number, min: 0, max: 100, default: 0 },
    faceMatchScore: { type: Number, min: 0, max: 100, default: 0 },
    addressScore: { type: Number, min: 0, max: 100, default: 0 },
    overallScore: { type: Number, min: 0, max: 100, default: 0 }
  },
  adminNotes: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Indexes
kycSchema.index({ userId: 1 });
kycSchema.index({ status: 1 });
kycSchema.index({ 'documents.aadhaar.number': 1 });
kycSchema.index({ 'documents.pan.number': 1 });

// Methods
kycSchema.methods.submit = async function() {
  this.status = 'submitted';
  this.submittedAt = new Date();
  await this.save();
  await mongoose.model('User').findByIdAndUpdate(this.userId, {
    kycStatus: 'submitted',
    kycSubmittedAt: this.submittedAt
  });
};
kycSchema.methods.approve = async function(reviewerId, notes = '') {
  this.status = 'approved';
  this.reviewedAt = new Date();
  this.reviewedBy = reviewerId;
  this.approvalDate = new Date();
  if (notes) {
    this.adminNotes.push({
      note: notes,
      addedBy: reviewerId,
      addedAt: new Date()
    });
  }
  await this.save();
  await mongoose.model('User').findByIdAndUpdate(this.userId, {
    kycStatus: 'approved',
    kycApprovedAt: this.approvalDate
  });
};
kycSchema.methods.reject = async function(reviewerId, reason, notes = '') {
  this.status = 'rejected';
  this.reviewedAt = new Date();
  this.reviewedBy = reviewerId;
  this.rejectionReason = reason;
  if (notes) {
    this.adminNotes.push({
      note: notes,
      addedBy: reviewerId,
      addedAt: new Date()
    });
  }
  await this.save();
  await mongoose.model('User').findByIdAndUpdate(this.userId, {
    kycStatus: 'rejected'
  });
};
kycSchema.statics.getStatistics = async function() {
  const pipeline = [
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ];
  const results = await this.aggregate(pipeline);
  const stats = {
    total: 0,
    draft: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    resubmission_required: 0
  };
  results.forEach(result => {
    stats[result._id] = result.count;
    stats.total += result.count;
  });
  return stats;
};

export default mongoose.model('KYC', kycSchema);