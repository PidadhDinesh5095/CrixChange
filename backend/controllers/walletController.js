import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

import { sendDepositConfirmationEmail, sendWithdrawalConfirmationEmail } from '../utils/sendEmail.js';
export const depositFunds = async (req, res) => {
  try {

    const { amount } = req.body;

    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpayInstance.orders.create(options);
    console.log("Order created:", order);
    res.status(200).json({
      success: true,
      message: 'Order created successfully',
      order
    });
    // try {
    //   await wallet.credit(amount, paymentMethod, 'Deposit');
    // } catch (error) {
    //   console.error('Error crediting wallet:', error);
    //   throw error;

    // }

    // // Fetch top 10 latest deposit/withdrawal transactions

    // const transactions = await Transaction.find({
    //   userId: req.user.id,
    //   type: { $in: ['credit', 'debit'] }
    // })
    //   .sort({ createdAt: -1 })
    //   .limit(10);


    // res.status(200).json({
    //   success: true,
    //   message: 'Funds deposited successfully',
    //   wallet,
    //   transactions
    // });
    // try {
    //   await sendDepositConfirmationEmail(req.user.email, req.user.firstName, amount, paymentMethod);
    // } catch (error) {
    //   console.error('Error sending deposit confirmation email:', error);
    // }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error depositing funds',
      error: error.message
    });
  }
};

export const verifyPayment = async (req, res) => {
  console.log('Verifying payment with data:', req.body); // Debug log
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, user,amount } = req.body;

    const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');
   
    if (generated_signature === razorpay_signature) {
      // Payment is successful, you can now credit the user's wallet
      const wallet = await Wallet.findOne({ userId: user.id });
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }
      try {
        await wallet.credit(amount, 'Deposit');
      } catch (error) {
        console.error('Error crediting wallet:', error);
        throw error;

      }
      const transactions = await Transaction.find({
        userId: user.id,
        type: { $in: ['credit', 'debit'] }
      })
        .sort({ createdAt: -1 })
        .limit(10);
      res.status(200).json({
        success: true,
        message: 'Payment Verified and Funds deposited successfully',
        wallet,
        transactions
      });
      try {
      await sendDepositConfirmationEmail(user.email, user.firstName, amount);
    } catch (error) {
      console.error('Error sending deposit confirmation email:', error);
    }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
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
    try {
      await sendWithdrawalConfirmationEmail(req.user.email, req.user.firstName, amount, 'completed');
    }
    catch (error) {
      console.error('Error sending withdrawal confirmation email:', error);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing withdrawal',
      error: error.message
    });
  }

};
export const getTransactionHistory = async (req, res) => {
  try {
    const { skip, limit } = req.query;
    const totalTransactions = await Transaction.countDocuments({
      userId: req.user.id
    });

    const transactions = await Transaction.find({
      userId: req.user.id,
      type: { $in: ['credit', 'debit'] }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Transaction history retrieved successfully',
      transactions,
      totalTransactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving transaction history',
      error: error.message
    });
  }
};