import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
<<<<<<< HEAD
  
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true
  },
  motherName: {
    type: String,
    required: [true, 'Mother name is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed'],
    required: [true, 'Marital status is required']
  },
  
  // Address Information
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'India'
    }
  },
  
  // Identity Documents
  documents: {
    // Aadhaar
    aadhaar: {
      number: {
        type: String,
        required: [true, 'Aadhaar number is required'],
        match: [/^[0-9]{12}$/, 'Please enter a valid 12-digit Aadhaar number']
      },
      frontImage: {
        type: String,
        required: [true, 'Aadhaar front image is required']
      },
      backImage: {
        type: String,
        required: [true, 'Aadhaar back image is required']
      }
    },
    
    // PAN
    pan: {
      number: {
        type: String,
        required: [true, 'PAN number is required'],
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
      },
      image: {
        type: String,
        required: [true, 'PAN image is required']
      }
    },
    
    // Selfie
    selfie: {
      type: String,
      required: [true, 'Selfie is required']
    },
    
    // Bank Account Proof (optional)
    bankStatement: {
      type: String
    }
  },
  
  // Bank Account Information
  bankAccount: {
    accountNumber: {
      type: String,
      required: [true, 'Bank account number is required']
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required'],
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required']
    },
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required']
    },
    accountType: {
      type: String,
      enum: ['savings', 'current'],
      required: [true, 'Account type is required']
    }
  },
  
  // Employment Information
  employment: {
    status: {
      type: String,
      enum: ['employed', 'self-employed', 'student', 'unemployed', 'retired'],
      required: [true, 'Employment status is required']
    },
    company: {
      type: String
    },
    designation: {
      type: String
    },
    annualIncome: {
      type: Number,
      required: [true, 'Annual income is required'],
      min: [0, 'Annual income cannot be negative']
    },
    incomeSource: {
      type: String,
      enum: ['salary', 'business', 'investment', 'other'],
      required: [true, 'Income source is required']
    }
  },
  
  // Trading Experience
  tradingExperience: {
    hasTraded: {
      type: Boolean,
      required: [true, 'Trading experience is required']
    },
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Experience level is required']
    },
    riskTolerance: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: [true, 'Risk tolerance is required']
    }
  },
  
=======
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
>>>>>>> master
  // Status and Verification
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'resubmission_required'],
    default: 'draft'
  },
<<<<<<< HEAD
  submittedAt: {
    type: Date
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    maxlength: [1000, 'Rejection reason cannot exceed 1000 characters']
  },
  approvalDate: {
    type: Date
  },
  
  // Verification Scores
  verificationScores: {
    documentScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    faceMatchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    addressScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Additional Notes
  adminNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});
=======
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
>>>>>>> master

// Indexes
kycSchema.index({ userId: 1 });
kycSchema.index({ status: 1 });
kycSchema.index({ 'documents.aadhaar.number': 1 });
kycSchema.index({ 'documents.pan.number': 1 });

<<<<<<< HEAD
// Method to submit KYC
=======
// Methods
>>>>>>> master
kycSchema.methods.submit = async function() {
  this.status = 'submitted';
  this.submittedAt = new Date();
  await this.save();
<<<<<<< HEAD
  
  // Update user KYC status
=======
>>>>>>> master
  await mongoose.model('User').findByIdAndUpdate(this.userId, {
    kycStatus: 'submitted',
    kycSubmittedAt: this.submittedAt
  });
};
<<<<<<< HEAD

// Method to approve KYC
=======
>>>>>>> master
kycSchema.methods.approve = async function(reviewerId, notes = '') {
  this.status = 'approved';
  this.reviewedAt = new Date();
  this.reviewedBy = reviewerId;
  this.approvalDate = new Date();
<<<<<<< HEAD
  
=======
>>>>>>> master
  if (notes) {
    this.adminNotes.push({
      note: notes,
      addedBy: reviewerId,
      addedAt: new Date()
    });
  }
<<<<<<< HEAD
  
  await this.save();
  
  // Update user KYC status
=======
  await this.save();
>>>>>>> master
  await mongoose.model('User').findByIdAndUpdate(this.userId, {
    kycStatus: 'approved',
    kycApprovedAt: this.approvalDate
  });
};
<<<<<<< HEAD

// Method to reject KYC
=======
>>>>>>> master
kycSchema.methods.reject = async function(reviewerId, reason, notes = '') {
  this.status = 'rejected';
  this.reviewedAt = new Date();
  this.reviewedBy = reviewerId;
  this.rejectionReason = reason;
<<<<<<< HEAD
  
=======
>>>>>>> master
  if (notes) {
    this.adminNotes.push({
      note: notes,
      addedBy: reviewerId,
      addedAt: new Date()
    });
  }
<<<<<<< HEAD
  
  await this.save();
  
  // Update user KYC status
=======
  await this.save();
>>>>>>> master
  await mongoose.model('User').findByIdAndUpdate(this.userId, {
    kycStatus: 'rejected'
  });
};
<<<<<<< HEAD

// Static method to get KYC statistics
kycSchema.statics.getStatistics = async function() {
  const pipeline = [
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ];
  
=======
kycSchema.statics.getStatistics = async function() {
  const pipeline = [
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ];
>>>>>>> master
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
<<<<<<< HEAD
  
=======
>>>>>>> master
  results.forEach(result => {
    stats[result._id] = result.count;
    stats.total += result.count;
  });
<<<<<<< HEAD
  
=======
>>>>>>> master
  return stats;
};

export default mongoose.model('KYC', kycSchema);