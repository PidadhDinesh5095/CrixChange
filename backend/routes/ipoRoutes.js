import express from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { getIPOs, getIPOById, buyIPO } from '../controllers/ipoController.js';

const router = express.Router();

router.get('/', asyncHandler(getIPOs));
router.get('/:id', asyncHandler(getIPOById));
router.post('/:id/buy', protect, asyncHandler(buyIPO));

export default router;
