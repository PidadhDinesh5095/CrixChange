import Wallet from '../models/Wallet.js';
import {sendDepositConfirmationEmail} from '../utils/sendEmail.js';
export const depositFunds = async (req, res) => {
  try {
    console.log('Deposit request received:', req.body); // Debug log
    const { amount, paymentMethod } = req.body;
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    wallet.balance += amount;
    await wallet.save();
    try{
        await sendDepositConfirmationEmail(req.user.email,req.user.name, amount, paymentMethod);
    }catch(error){
        console.error('Error sending deposit confirmation email:', error);
    }
    res.status(200).json({
      success: true,
      message: 'Funds deposited successfully',
      wallet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error depositing funds',
      error: error.message
    });
  }
};