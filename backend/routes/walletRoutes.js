import express from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { depositFunds,getWalletBalance,verifyPayment ,withdrawFunds,getTransactionHistory} from '../controllers/walletController.js';    

const router = express.Router();
router.post('/verify-payment', asyncHandler(verifyPayment));
router.use(protect);

router.get('/balance', asyncHandler(getWalletBalance));
router.post('/verify-payment', asyncHandler(verifyPayment));
router.get('/transactions', asyncHandler(getTransactionHistory));
router.post('/withdraw', asyncHandler(withdrawFunds));

router.post('/deposit', asyncHandler(depositFunds));

export default router;  
