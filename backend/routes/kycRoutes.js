import express from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import {
  getKYCStatus,
  submitKYC,
  uploadDocument,
  getKYCData
} from '../controllers/kycController.js';

const router = express.Router();

// All KYC routes are protected
router.use(protect);

// Get KYC status
router.get('/status', asyncHandler(getKYCStatus));

// Submit KYC application (multipart/form-data)
router.post('/submit', asyncHandler(submitKYC));

// Upload a single document (multipart/form-data)
router.post('/upload-document', asyncHandler(uploadDocument));

// Get full KYC data
router.get('/data', asyncHandler(getKYCData));

export default router;
