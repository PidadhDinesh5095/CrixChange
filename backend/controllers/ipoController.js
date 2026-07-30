import mongoose from 'mongoose';
import IPO from '../models/IPO.js';
import Stock from '../models/Stock.js';
import Wallet from '../models/Wallet.js';
import StockBalance from '../models/StockBalance.js';
import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
async function ensureCashBalance(userId) {
  let existing = await Wallet.findOne({ userId, currency: 'INR' })
  if (existing) return existing
  existing = await Wallet.create({ userId, currency: 'INR', balance: 0, frozenBalance: 0 })
  return existing
}

const ensureWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId, balance: 0, frozenBalance: 0, currency: 'INR' });
  }
  return wallet;
};

const ensureStockBalance = async (userId, stockId) => {
  let balance = await StockBalance.findOne({ userId, stockId });
  if (!balance) {
    balance = await StockBalance.create({ userId, stockId, total: 0, locked: 0 });
  }
  return balance;
};

// ---- Buyer funds: identical to your existing lock/unlock ----

async function lockBuyFunds(userId, price, qty) {
  const amount = price * qty
  const cash = await ensureCashBalance(userId)
  if (cash.balance < amount) throw new Error('Insufficient INR balance for IPO purchase')
  cash.balance -= amount
  cash.frozenBalance += amount
  await cash.save()
}

async function unlockBuyFunds(userId, amount) {
  if (amount <= 0) return
  const cash = await ensureCashBalance(userId)
  cash.balance += amount
  cash.frozenBalance = Math.max(0, cash.frozenBalance - amount)
  await cash.save()
}

// ---- IPO shares: mirrors lockSellQty/unlockSellQty, but the "total/locked"
// pair lives on the IPO document (availableShares/lockedShares) instead of
// a user's StockBalance, since these shares aren't owned by anyone yet ----

async function lockIPOShares(ipoId, qty) {
  const ipo = await IPO.findById(ipoId)
  if (!ipo) throw new Error('IPO not found')
  if (ipo.status !== 'OPEN') throw new Error('IPO is not open for purchase')
  if (ipo.availableShares < qty) throw new Error('Insufficient IPO shares available')
  ipo.availableShares -= qty
  ipo.lockedShares = (ipo.lockedShares || 0) + qty
  await ipo.save()
  return ipo
}

async function unlockIPOShares(ipoId, qty) {
  if (qty <= 0) return
  const ipo = await IPO.findById(ipoId)
  if (!ipo) return
  ipo.availableShares += qty
  ipo.lockedShares = Math.max(0, (ipo.lockedShares || 0) - qty)
  await ipo.save()
}

// ---- Settlement: finalizes an IPO buy. Funds were already locked upfront
// via lockBuyFunds — this permanently removes them from frozenBalance (they
// don't go back to balance, since this is a real purchase, not a cancel).
// Shares were already locked upfront via lockIPOShares — this permanently
// removes them from the IPO's lockedShares pool and credits them to the
// buyer's own StockBalance for the first time. ----

async function settleIPOBuy(userId, ipoId, stockId, amount, qty) {
  const ipo = await IPO.findById(ipoId)
  if (!ipo) throw new Error('IPO not found')
  if ((ipo.lockedShares || 0) < qty) {
    throw new Error(`Settlement mismatch: IPO ${ipoId} has ${ipo.lockedShares || 0} locked but ${qty} is being settled`)
  }
  ipo.lockedShares -= qty // permanently leaves the IPO pool — does NOT return to availableShares
  await ipo.save()

  const wallet = await Wallet.findOne({ userId })
  if (!wallet) throw new Error('Wallet not found')
  if (wallet.frozenBalance < amount) {
    throw new Error(`Settlement mismatch: user ${userId} has ${wallet.frozenBalance} frozen but ${amount} is being settled`)
  }
  wallet.frozenBalance -= amount // debited for good — no totalWithdrawn, no return to balance
  await wallet.save()

  const stockBal = await ensureStockBalance(userId, stockId)
  stockBal.total += qty // buyer now owns this quantity outright
  await stockBal.save()

  return { ipo, wallet, stockBal }
}

const ensureListedStock = async (ipo) => {
  let stock = await Stock.findById(ipo.stockId);
  if (stock) {
    return stock;
  }

  stock = await Stock.create({
    title: ipo.teamName,
    symbol: ipo.symbol
  });

  return stock;
};

const finalizeListing = async (ipo) => {
  const stock = await ensureListedStock(ipo);
  ipo.status = 'LISTED';
  ipo.listedTime = new Date();
  await ipo.save();
  return { ipo, stock };
};

export const getIPOs = asyncHandler(async (req, res) => {
  const ipos = await IPO.find().sort({ openTime: 1 }).lean();

  res.status(200).json({
    success: true,
    message: 'IPOs retrieved successfully',
    ipos
  });
});

export const getIPOById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid IPO id' });
  }

  const ipo = await IPO.findById(id).lean();

  if (!ipo) {
    return res.status(404).json({ success: false, message: 'IPO not found' });
  }

  res.status(200).json({
    success: true,
    message: 'IPO retrieved successfully',
    ipo
  });
});

export const buyIPO = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { quantity } = req.body
  const userId = req.user.id

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid IPO id' })
  }

  const qty = Number(quantity)
  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' })
  }

  const ipo = await IPO.findById(id)
  if (!ipo) {
    return res.status(404).json({ success: false, message: 'IPO not found' })
  }
  if (ipo.status !== 'OPEN') {
    return res.status(400).json({ success: false, message: 'IPO is not open for purchase' })
  }
  const now = new Date()
  if (now < ipo.openTime || now > ipo.closeTime) {
    return res.status(400).json({ success: false, message: 'IPO purchase window is not active' })
  }

  const amount = ipo.ipoPrice * qty

  let fundsLocked = false
  let sharesLocked = false

  try {
    await lockBuyFunds(userId, ipo.ipoPrice, qty)
    fundsLocked = true

    await lockIPOShares(id, qty)
    sharesLocked = true

    const freshIpo = await IPO.findById(id)

    let listedStock = null
    if (freshIpo.availableShares === 0) {
      const result = await finalizeListing(freshIpo)
      listedStock = result.stock
    }

    const { wallet, stockBal } = await settleIPOBuy(userId, id, freshIpo.stockId, amount, qty)

    await Transaction.create({
      userId,
      walletId: wallet._id,
      type: 'debit-ipo',
      amount,
      balanceAfter: wallet.balance,
      status: 'completed',
      reference: `IPO_BUY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    })

    return res.status(200).json({
      success: true,
      message: 'IPO shares purchased successfully',
      ipo: freshIpo,
      stock: listedStock,
      amount,
      quantity: qty,
      wallet,
      stockBalance: stockBal
    })
  } catch (error) {
    if (sharesLocked) await unlockIPOShares(id, qty)
    if (fundsLocked) await unlockBuyFunds(userId, amount)

    return res.status(400).json({ success: false, message: error.message || 'IPO purchase failed' })
  }
})
