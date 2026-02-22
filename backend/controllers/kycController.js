import KYC from '../models/KYC.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import { sendEmail } from '../utils/sendEmail.js'; // adjust path as needed

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/kyc/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.fieldname + path.extname(file.originalname));
  }
});

// Multer instance for KYC documents
export const kycUpload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter: (req, file, cb) => {
    // Accept images and pdfs
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed!'));
    }
  }
});

// GET /kyc/status
export const getKYCStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const kyc = await KYC.findOne({ userId });
    res.json({
      success: true,
      data: {
        status: kyc ? kyc.status : 'pending',
        kycData: kyc || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch KYC status' });
  }
};

// POST /kyc/submit
export const submitKYC = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // 1. Check if KYC already exists for user
    const existingKYC = await KYC.findOne({ userId });
    if (existingKYC) {
      return res.json({
        success: false,
        message: `KYC already submitted. Current status: ${existingKYC.status}`,
        status: existingKYC.status,
        kycData: existingKYC
      });
    }

    // 2. Check for duplicate Aadhaar, PAN, or Bank Account Number
    const { aadhaarNumber, panNumber } = req.body;
    // Handle both nested and flat bankAccount
    let bankAccountNumber = '';
    if (req.body.bankAccount && typeof req.body.bankAccount === 'object') {
      bankAccountNumber = req.body.bankAccount.accountNumber;
    } else if (req.body['bankAccount[accountNumber]']) {
      bankAccountNumber = req.body['bankAccount[accountNumber]'];
    }

    const duplicate = await KYC.findOne({
      $or: [
        { 'documents.aadhaar.number': aadhaarNumber },
        { 'documents.pan.number': panNumber },
        { 'bankAccount.accountNumber': bankAccountNumber }
      ]
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'KYC failed: Aadhaar, PAN, or Bank Account already used.'
      });
    }

    // 3. Parse address, bankAccount, employment, tradingExperience
    let address = req.body.address;
    let bankAccount = req.body.bankAccount;
    let employment = req.body.employment;
    let tradingExperience = req.body.tradingExperience;

    // If any are strings, parse them
    if (typeof address === 'string') address = JSON.parse(address);
    if (typeof bankAccount === 'string') bankAccount = JSON.parse(bankAccount);
    if (typeof employment === 'string') employment = JSON.parse(employment);
    if (typeof tradingExperience === 'string') tradingExperience = JSON.parse(tradingExperience);

    // If address is not an object, fallback to bracket notation
    if (!address || typeof address !== 'object') {
      address = {};
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('address[')) {
          const field = key.match(/address\[(.+)\]/)[1];
          address[field] = req.body[key];
        }
      });
    }
    // If bankAccount is not an object, fallback to bracket notation
    if (!bankAccount || typeof bankAccount !== 'object') {
      bankAccount = {};
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('bankAccount[')) {
          const field = key.match(/bankAccount\[(.+)\]/)[1];
          bankAccount[field] = req.body[key];
        }
      });
    }
    // If employment is not an object, fallback to bracket notation
    if (!employment || typeof employment !== 'object') {
      employment = {};
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('employment[')) {
          const field = key.match(/employment\[(.+)\]/)[1];
          employment[field] = req.body[key];
        }
      });
    }
    // If tradingExperience is not an object, fallback to bracket notation
    if (!tradingExperience || typeof tradingExperience !== 'object') {
      tradingExperience = {};
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('tradingExperience[')) {
          const field = key.match(/tradingExperience\[(.+)\]/)[1];
          tradingExperience[field] = req.body[key];
        }
      });
    }

    // 4. Handle documents (base64)
    const fileToBase64 = (file) => {
      if (!file) return '';
      const fs = require('fs');
      const filePath = file.path;
      try {
        const data = fs.readFileSync(filePath);
        return `data:${file.mimetype};base64,${data.toString('base64')}`;
      } catch (e) {
        return '';
      }
    };

    // If using JSON upload (not multipart), allow base64 directly from body
    let documents = {};
    if (req.files && Object.keys(req.files).length > 0) {
      documents = {
        aadhaar: {
          number: aadhaarNumber || '',
          frontImage: req.files?.aadhaar_front?.[0] ? fileToBase64(req.files.aadhaar_front[0]) : '',
          backImage: req.files?.aadhaar_back?.[0] ? fileToBase64(req.files.aadhaar_back[0]) : ''
        },
        pan: {
          number: panNumber || '',
          image: req.files?.pan_image?.[0] ? fileToBase64(req.files.pan_image[0]) : ''
        },
        selfie: req.files?.selfie?.[0] ? fileToBase64(req.files.selfie[0]) : '',
        bankStatement: req.files?.bankStatement?.[0] ? fileToBase64(req.files.bankStatement[0]) : ''
      };
    } else if (req.body.documents) {
      // If sent as JSON, use directly
      documents = req.body.documents;
    } else {
      // fallback: try to get base64 from body fields
      documents = {
        aadhaar: {
          number: aadhaarNumber || '',
          frontImage: req.body.aadhaar_front || '',
          backImage: req.body.aadhaar_back || ''
        },
        pan: {
          number: panNumber || '',
          image: req.body.pan_image || ''
        },
        selfie: req.body.selfie || '',
        bankStatement: req.body.bankStatement || ''
      };
    }

    // 5. Compose KYC data as per schema
    const kycData = {
      userId: userId,
      fullName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || '',
      fatherName: req.body.fatherName || '',
      motherName: req.body.motherName || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
      maritalStatus: req.body.maritalStatus || '',
      address: address || {},
      documents: documents,
      bankAccount: bankAccount || {},
      employment: employment || {},
      tradingExperience: tradingExperience || {},
      status: 'approved',
      submittedAt: new Date()
    };

    // Helper: convert string numbers to numbers for numeric fields
    function normalizeKYCData(kycData) {
      // Convert annualIncome to number
      if (
        kycData.employment &&
        typeof kycData.employment.annualIncome === 'string'
      ) {
        kycData.employment.annualIncome = Number(kycData.employment.annualIncome);
      }
      // Convert hasTraded to boolean
      if (
        kycData.tradingExperience &&
        typeof kycData.tradingExperience.hasTraded === 'string'
      ) {
        kycData.tradingExperience.hasTraded =
          kycData.tradingExperience.hasTraded === 'true';
      }
      // Remove empty objects for images (should be base64 string or '')
      if (kycData.documents) {
        if (
          kycData.documents.aadhaar &&
          typeof kycData.documents.aadhaar.frontImage === 'object'
        ) {
          kycData.documents.aadhaar.frontImage = '';
        }
        if (
          kycData.documents.aadhaar &&
          typeof kycData.documents.aadhaar.backImage === 'object'
        ) {
          kycData.documents.aadhaar.backImage = '';
        }
        if (
          kycData.documents.pan &&
          typeof kycData.documents.pan.image === 'object'
        ) {
          kycData.documents.pan.image = '';
        }
        if (typeof kycData.documents.selfie === 'object') {
          kycData.documents.selfie = '';
        }
        if (typeof kycData.documents.bankStatement === 'object') {
          kycData.documents.bankStatement = '';
        }
      }
      return kycData;
    }

    // Normalize types for mongoose schema
    normalizeKYCData(kycData);
console.log('Normalized KYC Data:', kycData);
    // 6. Save KYC
    try{
    const kyc = await KYC.create(kycData);
    } catch (e) {
      console.error('Error creating KYC:', e);
      throw e;
    }

    // 7. Update user KYC status
    await User.findByIdAndUpdate(userId, { kycStatus: 'approved' });

    // 8. Send approval email
   

    res.json({
      success: true,
      message: 'KYC submitted successfully',
      status: 'submitted',
      data: kycData
    });
     try {
      await sendEmail({
        email: user.email,
        subject: 'KYC Approved - Start Trading!',
        message: `
          <div style="font-family: Arial, sans-serif; background: #000; color: #fff; border-radius: 8px; padding: 32px; max-width: 480px; margin: 32px auto;">
            <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 16px; color: #fff;">KYC Approved!</h1>
            <p style="font-size: 1rem; color: #d1d5db; margin-bottom: 24px;">Congratulations! Your KYC has been approved. You can now start trading on CrixChange.</p>
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard" style="display: inline-block; padding: 12px 32px; background: #fff; color: #000; font-weight: bold; font-size: 1rem; border-radius: 6px; text-decoration: none; margin-bottom: 24px;">Start Trading</a>
            <p style="font-size: 0.95rem; color: #d1d5db; margin-top: 16px;">If you have any questions, contact support.</p>
            <div style="margin-top:32px; text-align:center;">
              <span style="font-size: 1.2rem; font-weight: bold; color: #fff;">CRIXCHANGE</span>
            </div>
          </div>
        `
      });
    } catch (e) {
      // Don't fail if email fails
    }
    console.log('email sent ');
  } catch (error) {
    console.log('Submission error:', error);
    res.status(500).json({ success: false, message: 'KYC submission failed', error: error.message });
  }
};

// POST /kyc/upload-document
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.json({
      success: true,
      data: {
        document: {
          filename: req.file.filename || req.file.originalname,
          type: req.body.type
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Document upload failed' });
  }
};

// GET /kyc/data
export const getKYCData = async (req, res) => {
  try {
    const userId = req.user.id;
    const kyc = await KYC.findOne({ userId });
    res.json({
      success: true,
      data: {
        status: kyc ? kyc.status : 'pending',
        kycData: kyc || null,
        documents: kyc?.documents || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch KYC data' });
  }
};
