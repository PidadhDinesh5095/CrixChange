import Joi from 'joi';

// User registration validation
export const validateRegister = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    password: Joi.string().min(8).required(),
    dateOfBirth: Joi.date().max('now').required(),
    gender: Joi.string().valid('male', 'female', 'other').required()
  });

  return schema.validate(data);
};

// User login validation
export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  return schema.validate(data);
};

// Profile update validation
export const validateProfileUpdate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^[0-9]{10}$/),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark'),
      notifications: Joi.object({
        email: Joi.boolean(),
        push: Joi.boolean(),
        trades: Joi.boolean(),
        deposits: Joi.boolean(),
        withdrawals: Joi.boolean(),
        kyc: Joi.boolean()
      }),
      language: Joi.string()
    })
  });

  return schema.validate(data);
};

// Password change validation
export const validatePasswordChange = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
  });

  return schema.validate(data);
};

// KYC validation
export const validateKYC = (data) => {
  const schema = Joi.object({
    personalInfo: Joi.object({
      fullName: Joi.string().min(2).max(100).required(),
      fatherName: Joi.string().min(2).max(100).required(),
      motherName: Joi.string().min(2).max(100).required(),
      dateOfBirth: Joi.date().max('now').required(),
      gender: Joi.string().valid('male', 'female', 'other').required(),
      maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed').required(),
      address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        pincode: Joi.string().pattern(/^[0-9]{6}$/).required(),
        country: Joi.string().default('India')
      }).required()
    }).required(),
    documents: Joi.object({
      aadhaar: Joi.object({
        number: Joi.string().pattern(/^[0-9]{12}$/).required()
      }).required(),
      pan: Joi.object({
        number: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required()
      }).required()
    }).required(),
    bankAccount: Joi.object({
      accountNumber: Joi.string().required(),
      ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required(),
      bankName: Joi.string().required(),
      accountHolderName: Joi.string().required(),
      accountType: Joi.string().valid('savings', 'current').required()
    }).required(),
    employment: Joi.object({
      status: Joi.string().valid('employed', 'self-employed', 'student', 'unemployed', 'retired').required(),
      company: Joi.string().allow(''),
      designation: Joi.string().allow(''),
      annualIncome: Joi.number().min(0).required(),
      incomeSource: Joi.string().valid('salary', 'business', 'investment', 'other').required()
    }).required(),
    tradingExperience: Joi.object({
      hasTraded: Joi.boolean().required(),
      experience: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
      riskTolerance: Joi.string().valid('low', 'medium', 'high').required()
    }).required()
  });

  return schema.validate(data);
};

// Order validation
export const validateOrder = (data) => {
  const schema = Joi.object({
    teamId: Joi.string().required(),
    type: Joi.string().valid('buy', 'sell').required(),
    orderType: Joi.string().valid('market', 'limit', 'stop').default('market'),
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().min(0).required(),
    limitPrice: Joi.number().min(0),
    stopPrice: Joi.number().min(0)
  });

  return schema.validate(data);
};

// Wallet transaction validation
export const validateWalletTransaction = (data) => {
  const schema = Joi.object({
    amount: Joi.number().min(1).required(),
    type: Joi.string().valid('deposit', 'withdrawal').required(),
    method: Joi.string().when('type', {
      is: 'deposit',
      then: Joi.string().valid('upi', 'card', 'netbanking').required(),
      otherwise: Joi.string().valid('bank_transfer').required()
    })
  });

  return schema.validate(data);
};

// Team validation
export const validateTeam = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    shortName: Joi.string().min(2).max(10).required(),
    sport: Joi.string().valid('cricket', 'football', 'basketball', 'tennis').required(),
    league: Joi.string().required(),
    country: Joi.string().required(),
    currentPrice: Joi.number().min(0).default(100),
    totalShares: Joi.number().integer().min(1).default(1000000),
    isActive: Joi.boolean().default(true),
    isTradingEnabled: Joi.boolean().default(true)
  });

  return schema.validate(data);
};

// Match validation
export const validateMatch = (data) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    team1Id: Joi.string().required(),
    team2Id: Joi.string().required(),
    startTime: Joi.date().min('now').required(),
    endTime: Joi.date().min(Joi.ref('startTime')),
    sport: Joi.string().valid('cricket', 'football', 'basketball', 'tennis').required(),
    league: Joi.string().required(),
    venue: Joi.string(),
    status: Joi.string().valid('upcoming', 'live', 'completed', 'cancelled').default('upcoming')
  });

  return schema.validate(data);
};

// Admin user validation
export const validateAdminUser = (data) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    action: Joi.string().valid('activate', 'deactivate', 'ban', 'unban').required(),
    reason: Joi.string().when('action', {
      is: Joi.string().valid('ban', 'deactivate'),
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    })
  });

  return schema.validate(data);
};

// KYC review validation
export const validateKYCReview = (data) => {
  const schema = Joi.object({
    kycId: Joi.string().required(),
    action: Joi.string().valid('approve', 'reject', 'request_resubmission').required(),
    reason: Joi.string().when('action', {
      is: 'reject',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    }),
    notes: Joi.string().max(1000).optional()
  });

  return schema.validate(data);
};

// Email validation
export const validateEmail = (email) => {
  const schema = Joi.string().email().required();
  return schema.validate(email);
};

// Phone validation
export const validatePhone = (phone) => {
  const schema = Joi.string().pattern(/^[0-9]{10}$/).required();
  return schema.validate(phone);
};

// Password validation
export const validatePassword = (password) => {
  const schema = Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    });
  
  return schema.validate(password);
};

// File validation
export const validateFile = (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  const errors = [];

  if (!file) {
    errors.push('File is required');
    return { error: { details: [{ message: errors.join(', ') }] } };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  if (file.size > maxSize) {
    errors.push(`File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
  }

  if (errors.length > 0) {
    return { error: { details: [{ message: errors.join(', ') }] } };
  }

  return { error: null };
};

// Pagination validation
export const validatePagination = (data) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  });

  return schema.validate(data);
};

// Date range validation
export const validateDateRange = (data) => {
  const schema = Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required()
  });

  return schema.validate(data);
};