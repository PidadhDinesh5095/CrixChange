import express from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { depositFunds,getWalletBalance ,withdrawFunds,getTransactionHistory} from '../controllers/walletController.js';    

const router = express.Router();
router.use(protect);

router.get('/balance', asyncHandler(getWalletBalance));
router.get('/transactions', asyncHandler(getTransactionHistory));
router.post('/withdraw', asyncHandler(withdrawFunds));

router.post('/deposit', asyncHandler(depositFunds));

export default router;  
