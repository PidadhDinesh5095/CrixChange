import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import { sendDepositConfirmationEmail, sendWithdrawalConfirmationEmail } from '../utils/sendEmail.js';
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

    try {
      await wallet.credit(amount, paymentMethod, 'Deposit');
    } catch (error) {
      console.error('Error crediting wallet:', error);
      throw error;
      
    }
    try {
      await sendDepositConfirmationEmail(req.user.email, req.user.firstName, amount, paymentMethod);
    } catch (error) {
      console.error('Error sending deposit confirmation email:', error);
    }
    // Fetch top 10 latest deposit/withdrawal transactions
    const transactions = await Transaction.find({
      userId: req.user.id,
      type: { $in: ['deposit', 'withdrawal'] }
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      message: 'Funds deposited successfully',
      wallet,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error depositing funds',
      error: error.message
    });
  }
};
export const getWalletBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    const transactions = await Transaction.find({
      userId: req.user.id,
      type: { $in: ['credit', 'debit'] }
    })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({
      success: true,
      message: 'Wallet balance retrieved successfully',
      wallet,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving wallet balance',
      error: error.message
    });
  }
};
export const withdrawFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }
    if (amount > wallet.balance - wallet.frozenBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds'
      });
    }
    try {
      await wallet.debit(amount, 'Withdrawal');
    } catch (error) {
      console.error('Error debiting wallet:', error);
      throw error;
    }
    try {
      await sendWithdrawalConfirmationEmail(req.user.email, req.user.firstName, amount, 'completed');
    }
    catch (error) {
      console.error('Error sending withdrawal confirmation email:', error);
    }
    // Fetch top 10 latest deposit/withdrawal transactions
    const transactions = await Transaction.find({
      userId: req.user.id,
      type: { $in: ['credit', 'debit'] }
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      message: 'Funds withdrawn successfully',
      wallet,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing withdrawal',
      error: error.message
    });
  }

};