import express from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { depositFunds } from '../controllers/walletController.js';    

const router = express.Router();
router.use(protect);


router.post('/deposit', asyncHandler(depositFunds));

export default router;  
