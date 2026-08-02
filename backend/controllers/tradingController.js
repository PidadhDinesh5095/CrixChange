import Order from '../models/Order.js'
import wallet from '../models/Wallet.js'
import Stock from '../models/Stock.js'
import StockBalance from '../models/StockBalance.js'
import User from '../models/User.js'
import mongoose from 'mongoose'
import Fill from '../models/Fill.js'
import IPO from '../models/IPO.js'
import { seedStockStats } from '../utils/stockStatService.js';
import { updateStockStats } from '../utils/stockStatService.js';
import { io } from '../server.js'
import { STOCK_STATS } from '../utils/stockStatService.js'
import CompanyWallet from '../models/CompanyWallet.js'
import { publishEvent, EVENT_TYPES } from '../kafka/index.js';
import { CompensationStack, enqueueForStock } from '../utils/compensation.js'


const INR = 'INR'
const PAGE_SIZE = 10

const COMMISSION_RATE = 0.03

// In-memory orderbooks
const ORDERBOOKS = new Map()
const SYMBOL_BY_STOCK_ID = new Map()


function ensureBook(symbol) {
  const normalized = symbol.toUpperCase()
  const book = ORDERBOOKS.get(normalized)
  if (book) return book
  const nextBook = { bids: new Map(), asks: new Map() }
  ORDERBOOKS.set(normalized, nextBook)
  return nextBook
}

function getSideMap(book, side) {
  return side === 'BUY' ? book.bids : book.asks
}

function addOrderToBook(order) {
  if (order.orderType !== 'LIMIT' || order.price == null) return
  const remainingQty = order.quantity - order.filledQuantity
  if (remainingQty <= 0) return
  const symbol = SYMBOL_BY_STOCK_ID.get(String(order.stockId))
  if (!symbol) return
  const book = ensureBook(symbol)
  const sideMap = getSideMap(book, order.side)
  const level = sideMap.get(order.price) ?? { totalQty: 0, orders: [] }
  level.totalQty += remainingQty
  level.orders.push({ orderId: String(order._id), userId: String(order.userId), qty: order.quantity, filledQty: order.filledQuantity, createdAt: order.createdAt.toISOString() })
  sideMap.set(order.price, level)
}

function reduceOrderFromBook(order, reductionQty) {
  if (order.price == null || reductionQty <= 0) return
  const symbol = SYMBOL_BY_STOCK_ID.get(String(order.stockId))
  if (!symbol) {
    console.log("symbol not found");
    return
  }
  const book = ORDERBOOKS.get(symbol)
  if (!book) return
  const sideMap = getSideMap(book, order.side)
  const level = sideMap.get(order.price)
  if (!level) return
  level.totalQty = Math.max(0, level.totalQty - reductionQty)
  const restingOrder = level.orders.find((e) => e.orderId === String(order.id || order._id))
  if (restingOrder) restingOrder.filledQty += reductionQty
  level.orders = level.orders.filter((entry) => entry.orderId !== String(order.id || order._id) || entry.filledQty < entry.qty)
  if (level.totalQty <= 0 || level.orders.length === 0) sideMap.delete(order.price)
  else sideMap.set(order.price, level)
}

function removeOrderFromBook(order) {
  if (order.price == null) return
  const remainingQty = order.quantity - order.filledQuantity
  if (remainingQty <= 0) return
  const symbol = SYMBOL_BY_STOCK_ID.get(String(order.stockId))
  if (!symbol) return
  const book = ORDERBOOKS.get(symbol)
  if (!book) return
  const sideMap = getSideMap(book, order.side)
  const level = sideMap.get(order.price)
  if (!level) return
  level.totalQty = Math.max(0, level.totalQty - remainingQty)
  level.orders = level.orders.filter((entry) => entry.orderId !== String(order._id))
  if (level.totalQty <= 0 || level.orders.length === 0) sideMap.delete(order.price)
  else sideMap.set(order.price, level)
}


function printOrderBook(symbol) {
  const normalized = symbol.toUpperCase();
  const book = ORDERBOOKS.get(normalized);

  if (!book) {
    console.log(`No order book found for ${normalized}`);
    return;
  }

  console.log(`\n========== ${normalized} ORDER BOOK ==========`);

  console.log("\nASKS");
  [...book.asks.entries()]
    .sort((a, b) => a[0] - b[0])
    .forEach(([price, level]) => {
      console.log(
        `₹${price} | Qty: ${level.totalQty} | Orders: ${level.orders.length}`
      );

      level.orders.forEach(order => {
        console.log(
          `   ${order.orderId} | User: ${order.userId} | Remaining: ${order.qty - order.filledQty}`
        );
      });
    });

  console.log("\nBIDS");
  [...book.bids.entries()]
    .sort((a, b) => b[0] - a[0])
    .forEach(([price, level]) => {
      console.log(
        `₹${price} | Qty: ${level.totalQty} | Orders: ${level.orders.length}`
      );

      level.orders.forEach(order => {
        console.log(
          `   ${order.orderId} | User: ${order.userId} | Remaining: ${order.qty - order.filledQty}`
        );
      });
    });

  console.log("======================================\n");
}
async function ensureCompanyWallet(currency = INR) {
  let existing = await CompanyWallet.findOne({ currency })
  if (existing) return existing
  existing = await CompanyWallet.create({ currency, balance: 0, totalCommissionEarned: 0 })
  return existing
}

// Routes commission revenue collected from a single fill into the company wallet.
async function collectCommission(amount, description) {
  if (amount <= 0) return
  const companyWallet = await ensureCompanyWallet(INR)
  await companyWallet.credit(amount, description)
}


async function reverseCommission(amount, description) {
  if (amount <= 0) return
  const companyWallet = await ensureCompanyWallet(INR)
  if (typeof companyWallet.debit === 'function') {
    await companyWallet.debit(amount, description)
  } else {
    console.error('CompanyWallet has no debit() method — commission rollback skipped for:', description)
  }
}


function getDepth(id) {
  const symbol = SYMBOL_BY_STOCK_ID.get(String(id));
  const normalized = symbol.toUpperCase()
  const book = ORDERBOOKS.get(normalized)
  if (!book) return { bids: {}, asks: {} }
  const bids = Object.fromEntries([...book.bids.entries()].sort((a, b) => b[0] - a[0]).slice(0, 20).map(([price, level]) => [String(price), { totalQty: level.totalQty, orders: level.orders }]))
  const asks = Object.fromEntries([...book.asks.entries()].sort((a, b) => a[0] - b[0]).slice(0, 20).map(([price, level]) => [String(price), { totalQty: level.totalQty, orders: level.orders }]))


  return { bids, asks }
}

function getUserId(req) {
  const fromHeader = req.header('x-user-id')
  if (fromHeader) {
    try { return mongoose.Types.ObjectId(fromHeader) } catch { return null }
  }
  if (req.body && typeof req.body === 'object' && req.body.userId) {
    try { return mongoose.Types.ObjectId(req.body.userId) } catch { }
  }
  if (typeof req.query.userId === 'string') {
    try { return mongoose.Types.ObjectId(req.query.userId) } catch { }
  }
  return null
}

async function ensureCashBalance(userId) {
  let existing = await wallet.findOne({ userId, currency: INR })
  if (existing) return existing
  existing = await wallet.create({ userId, currency: INR, balance: 0, frozenBalance: 0 })
  return existing
}

async function ensureStockBalance(userId, stockId) {
  let existing = await StockBalance.findOne({ userId, stockId })
  if (existing) return existing
  existing = await StockBalance.create({ userId, stockId, total: 0, locked: 0 })
  return existing
}

async function lockBuyFunds(userId, price, qty) {
  const amount = price * qty
  const cash = await ensureCashBalance(userId)
  if (cash.balance < amount) throw new Error('Insufficient INR balance for buy LIMIT order')
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

async function lockSellQty(userId, stockId, qty) {
  const stockBal = await ensureStockBalance(userId, stockId)
  if (stockBal.total < qty) throw new Error('Insufficient stock quantity for sell LIMIT order')
  stockBal.total -= qty
  stockBal.locked += qty
  await stockBal.save()
}

async function unlockSellQty(userId, stockId, qty) {
  if (qty <= 0) return
  const stockBal = await ensureStockBalance(userId, stockId)
  stockBal.total += qty
  stockBal.locked = Math.max(0, stockBal.locked - qty)
  await stockBal.save()
}

async function getStockByMarketId(marketId) {
  const trimmed = String(marketId).trim()
  const asObjectId = mongoose.isValidObjectId(trimmed) ? trimmed : null
  if (asObjectId) {
    return Stock.findById(asObjectId)
  }
  return Stock.findOne({ symbol: trimmed.toUpperCase() })
}

export const getStocks = async (_req, res) => {
  const stocks = await Stock.find().select('_id title symbol image')
  return res.json({ stocks })
}
export const getDepthBySymbol = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();

    if (!id) {
      return res.status(400).json({ message: 'Stock id is required' });
    }

    const data = getDepth(id);

    if (!data) {
      return res.status(404).json({ message: 'No order book depth found for this stock' });
    }

    return res.status(200).json({ id, data });
  } catch (err) {
    console.error('getDepthBySymbol error:', err);
    return res.status(500).json({ message: 'Failed to fetch order book depth' });
  }
};

// Buyer's side of a fill: the wallet funds were already frozen (either
// upfront via lockBuyFunds for LIMIT, or right before this call via
// freezeAmount for MARKET — see marketOrderExecution). This call finalizes
// that reservation into an actual spend, and credits the stock to the buyer.

async function settleBuyerFill(userId, stockId, amount, qty) {
  const userwallet = await wallet.findOne({ userId })
  await userwallet.unfreezeAmount(amount, `Buy settlement: ${qty} unit(s) of stock ${stockId}`)

  // Commission sits on top of the frozen trade amount, taken out of
  // whatever available balance the buyer currently has — it was never
  // part of the original lockBuyFunds/freezeAmount reservation.
  const buyerCommission = Number((amount * COMMISSION_RATE).toFixed(2))
  if (buyerCommission > 0) {
    userwallet.balance -= buyerCommission
    await userwallet.save()
    await collectCommission(buyerCommission, `Buyer commission on ${qty} unit(s) of stock ${stockId} (order fill)`)
  }

  const stockBal = await ensureStockBalance(userId, stockId)
  stockBal.total += qty // buyer now owns this quantity outright
  await stockBal.save()
}

// Inverse of settleBuyerFill — used only during rollback. Re-freezes the
// amount, strips the credited stock qty back off, and refunds the
// commission that was deducted from the buyer's balance (and reverses it
// out of the company wallet).
async function undoSettleBuyerFill(userId, stockId, amount, qty) {
  const userwallet = await wallet.findOne({ userId })
  const buyerCommission = Number((amount * COMMISSION_RATE).toFixed(2))

  if (buyerCommission > 0) {
    userwallet.balance += buyerCommission
    await userwallet.save()
    await reverseCommission(buyerCommission, `Rollback: buyer commission reversed for stock ${stockId}`)
  }

  await userwallet.freezeAmount(amount)

  const stockBal = await ensureStockBalance(userId, stockId)
  stockBal.total -= qty
  await stockBal.save()
}

// Seller's side of a fill: the stock qty was already locked upfront via
// lockSellQty. This call finalizes that reservation — the locked stock is
// permanently gone (sold), and the sale proceeds are credited to the wallet.


async function settleSellerFill(userId, stockId, amount, qty) {
  const stockBal = await StockBalance.findOne({ userId, stockId })
  if (stockBal.locked < qty) {
    throw new Error(`Settlement mismatch: seller ${userId} has ${stockBal.locked} locked but ${qty} is being settled`)
  }
  stockBal.locked -= qty // permanently leaves locked — does NOT return to total
  await stockBal.save()

  const sellerCommission = Number((amount * COMMISSION_RATE).toFixed(2))
  const netAmount = Number((amount - sellerCommission).toFixed(2))

  const userwallet = await wallet.findOne({ userId })
  await userwallet.credit(netAmount, `Sell settlement: ${qty} unit(s) of stock ${stockId} (commission: ${sellerCommission})`)

  if (sellerCommission > 0) {
    await collectCommission(sellerCommission, `Seller commission on ${qty} unit(s) of stock ${stockId} (order fill)`)
  }
}

// Inverse of settleSellerFill — used only during rollback. Restores the
// locked stock qty, claws back the net amount credited to the seller, and
// reverses the commission routed to the company wallet.
async function undoSettleSellerFill(userId, stockId, amount, qty) {
  const stockBal = await StockBalance.findOne({ userId, stockId })
  stockBal.locked += qty
  await stockBal.save()

  const sellerCommission = Number((amount * COMMISSION_RATE).toFixed(2))
  const netAmount = Number((amount - sellerCommission).toFixed(2))

  const userwallet = await wallet.findOne({ userId })
  userwallet.balance -= netAmount
  await userwallet.save()

  if (sellerCommission > 0) {
    await reverseCommission(sellerCommission, `Rollback: seller commission reversed for stock ${stockId}`)
  }
}




async function limitOrderExecution(userId, side, stockId, price, qty, compensation, pendingEvents) {
  const opposingSide = side === 'BUY' ? 'SELL' : 'BUY'
  if (qty <= 0) return
  const symbol = SYMBOL_BY_STOCK_ID.get(String(stockId))
  if (!symbol) throw new Error('Unknown stock symbol for this stockId')

  const book = ensureBook(symbol)
  const sideMap = getSideMap(book, opposingSide)
  const level = sideMap.get(price)

  if (!level) {
    console.log(`No resting orders at price ${price} for ${opposingSide}. Creating new order for ${side} of ${qty} units.`);
    const incomingOrder = await Order.create({
      userId, side, orderType: 'LIMIT', stockId, price,
      quantity: qty, filledQuantity: 0, status: 'OPEN'
    })
    compensation.push('create incoming order (resting)', async () => {
      await Order.deleteOne({ _id: incomingOrder._id })
    })

    addOrderToBook(incomingOrder)
    compensation.push('addOrderToBook (resting)', async () => {
      removeOrderFromBook(incomingOrder)
    })

    return { filledQty: 0, remainingQty: qty, orderId: incomingOrder._id, order: incomingOrder }
  }
  const user = await User.findById(userId)
  // Create the incoming order UP FRONT so fills have a valid orderId to reference
  const incomingOrder = await Order.create({
    userId, side, orderType: 'LIMIT', stockId, price,
    quantity: qty, filledQuantity: 0, status: 'OPEN'
  })
  compensation.push('create incoming order', async () => {
    await Order.deleteOne({ _id: incomingOrder._id })
  })

  let remaining = qty
  const restingOrders = [...level.orders]

  for (const resting of restingOrders) {
    if (remaining <= 0 || resting.status === 'CLOSED') break
    const restingRemaining = resting.qty - resting.filledQty
    if (restingRemaining <= 0) continue

    // Self-trade prevention: never match against your own resting order.
  
    if (String(resting.userId) === String(userId)) continue

    const fillQty = Math.min(remaining, restingRemaining)
    const amount = price * fillQty

    const oppositeOrder = await Order.findById(resting.orderId)
    if (!oppositeOrder) continue

    const prevFilledQty = oppositeOrder.filledQuantity
    const prevStatus = oppositeOrder.status
    oppositeOrder.filledQuantity += fillQty
    oppositeOrder.status = oppositeOrder.filledQuantity >= oppositeOrder.quantity ? 'CLOSED' : 'OPEN'
    await oppositeOrder.save()
    compensation.push(`revert opposite order ${oppositeOrder._id}`, async () => {
      await Order.updateOne(
        { _id: oppositeOrder._id },
        { $set: { filledQuantity: prevFilledQty, status: prevStatus } }
      )
    })

    reduceOrderFromBook({ price, side: opposingSide, id: resting.orderId, stockId }, fillQty)
    compensation.push(`re-add reduced book qty for ${resting.orderId}`, async () => {
      // Inverse of reduceOrderFromBook. Safe to hand-reverse because this
      // stock's queue slot guarantees nothing else has touched the book
      // since we reduced it.
      const restoreBook = ensureBook(symbol)
      const restoreSideMap = getSideMap(restoreBook, opposingSide)
      const restoreLevel = restoreSideMap.get(price) ?? { totalQty: 0, orders: [] }
      restoreLevel.totalQty += fillQty
      const existingEntry = restoreLevel.orders.find(o => o.orderId === String(resting.orderId))
      if (existingEntry) existingEntry.filledQty -= fillQty
      else restoreLevel.orders.push({ ...resting })
      restoreSideMap.set(price, restoreLevel)
    })

    const buyerUserId = side === 'BUY' ? userId : resting.userId
    const sellerUserId = side === 'BUY' ? resting.userId : userId
    const buyOrderId = side === 'BUY' ? incomingOrder._id : resting.orderId
    const sellOrderId = side === 'BUY' ? resting.orderId : incomingOrder._id

    await settleBuyerFill(buyerUserId, stockId, amount, fillQty)
    compensation.push(`undo settleBuyerFill for ${buyerUserId}`, async () => {
      await undoSettleBuyerFill(buyerUserId, stockId, amount, fillQty)
    })

    await settleSellerFill(sellerUserId, stockId, amount, fillQty)
    compensation.push(`undo settleSellerFill for ${sellerUserId}`, async () => {
      await undoSettleSellerFill(sellerUserId, stockId, amount, fillQty)
    })

    // Record the fill — one row per matched trade
    const prevPrice = STOCK_STATS.get(stockId.toString())?.price;

    const newFill = await Fill.create({
      stockId,
      price,
      qty: fillQty,
      buyOrderId,
      sellOrderId
    });
    compensation.push(`delete fill ${newFill._id}`, async () => {
      await Fill.deleteOne({ _id: newFill._id })
    })

    const up = prevPrice !== undefined ? price >= prevPrice : true;

    const oppositeUser = await User.findById(resting.userId)
    const oppSide = side === 'BUY' ? 'SELL' : 'BUY'

    // Deferred — only fired after the whole order commits (see executeOrder)
    pendingEvents.push(() => {
      const data = {
        stockId,
        userId,
        data: {
          price,
          qty: fillQty,
          time: newFill.createdAt.toISOString(),
          up
        }
      };
      io.emit('trade', data);
    })
    pendingEvents.push(() => publishEvent(EVENT_TYPES.TRADE_EXECUTED, oppositeUser._id, { email: oppositeUser.email, name: oppositeUser.firstName, tradeDetails: { type: oppSide, team: symbol, quantity: fillQty, price: price, totalAmount: amount } }))

    incomingOrder.filledQuantity += fillQty

    const prevStats = STOCK_STATS.get(stockId.toString())
      ? { ...STOCK_STATS.get(stockId.toString()) }
      : null
    updateStockStats(stockId, price, fillQty) // per-fill, so volume accumulates fill-by-fill
    compensation.push(`revert stock stats for ${stockId}`, async () => {
      if (prevStats) STOCK_STATS.set(stockId.toString(), prevStats)
      else STOCK_STATS.delete(stockId.toString())
    })

    remaining -= fillQty
  }

  incomingOrder.status = remaining <= 0 ? 'CLOSED' : 'OPEN'
  await incomingOrder.save()
  compensation.push('revert incoming order final state', async () => {
    // incomingOrder was created fresh in this same transaction, so its
    // true prior state is 0 filled / OPEN.
    await Order.updateOne(
      { _id: incomingOrder._id },
      { $set: { filledQuantity: 0, status: 'OPEN' } }
    )
  })

  pendingEvents.push(() => publishEvent(EVENT_TYPES.TRADE_EXECUTED, userId, { email: user.email, name: user.firstName, tradeDetails: { type: side, team: symbol, quantity: qty - remaining, price: price, totalAmount: (qty - remaining) * price } }))

  if (remaining > 0) {
    addOrderToBook(incomingOrder)
    compensation.push('addOrderToBook (remainder resting)', async () => {
      removeOrderFromBook(incomingOrder)
    })
  }

  return { filledQty: qty - remaining, remainingQty: remaining, order: incomingOrder }
}


async function marketOrderExecution(userId, side, stockId, qty, compensation, pendingEvents) {
  if (qty <= 0) return;

  const opposingSide = side === "BUY" ? "SELL" : "BUY";
  const symbol = SYMBOL_BY_STOCK_ID.get(String(stockId));
  if (!symbol) throw new Error('Unknown stock symbol for this stockId')

  const book = ensureBook(symbol);
  const sideMap = getSideMap(book, opposingSide);

  // Create the incoming order up front so Fill documents have a valid orderId
  const incomingOrder = await Order.create({
    userId,
    side,
    orderType: "MARKET",
    stockId,
    price: null,
    averagePrice: null,
    quantity: qty,
    filledQuantity: 0,
    status: "OPEN",
  });
  compensation.push('create incoming market order', async () => {
    await Order.deleteOne({ _id: incomingOrder._id })
  })

  let remaining = qty;
  let filledQty = 0;
  let totalAmount = 0;

  const sortedPrices = [...sideMap.keys()].sort((a, b) =>
    side === "BUY" ? a - b : b - a
  );
  const user = await User.findById(userId);

  outer: for (const price of sortedPrices) {
    if (remaining <= 0) break;

    const level = sideMap.get(price);
    if (!level) continue;

    const restingOrders = [...level.orders];

    for (const resting of restingOrders) {
      if (remaining <= 0) break;

      const restingRemaining = resting.qty - resting.filledQty;
      if (restingRemaining <= 0) continue;

      // Self-trade prevention: skip your own resting order at this price
     
      if (String(resting.userId) === String(userId)) continue;

      const fillQty = Math.min(remaining, restingRemaining);
      const amount = price * fillQty;

      // Market BUY: check balance just before each fill
      if (side === "BUY") {
        const buyerWallet = await wallet.findOne({ userId });

        if (!buyerWallet || buyerWallet.availableBalance < amount) {
          break outer;
        }

        await buyerWallet.freezeAmount(amount);
        compensation.push(`unfreeze market buy amount for ${userId}`, async () => {
          const w = await wallet.findOne({ userId })
          await w.unfreezeAmount(amount, `Rollback: market buy freeze reversed for stock ${stockId}`)
        })
      }

      const oppositeOrder = await Order.findById(resting.orderId);
      if (!oppositeOrder) continue;

      const prevFilledQty = oppositeOrder.filledQuantity
      const prevStatus = oppositeOrder.status
      oppositeOrder.filledQuantity += fillQty;
      oppositeOrder.status =
        oppositeOrder.filledQuantity >= oppositeOrder.quantity
          ? "CLOSED"
          : "OPEN";

      await oppositeOrder.save();
      compensation.push(`revert opposite order ${oppositeOrder._id}`, async () => {
        await Order.updateOne(
          { _id: oppositeOrder._id },
          { $set: { filledQuantity: prevFilledQty, status: prevStatus } }
        )
      })

      reduceOrderFromBook(
        { price, side: opposingSide, id: resting.orderId, stockId },
        fillQty
      );
      compensation.push(`re-add reduced book qty for ${resting.orderId}`, async () => {
        const restoreBook = ensureBook(symbol)
        const restoreSideMap = getSideMap(restoreBook, opposingSide)
        const restoreLevel = restoreSideMap.get(price) ?? { totalQty: 0, orders: [] }
        restoreLevel.totalQty += fillQty
        const existingEntry = restoreLevel.orders.find(o => o.orderId === String(resting.orderId))
        if (existingEntry) existingEntry.filledQty -= fillQty
        else restoreLevel.orders.push({ ...resting })
        restoreSideMap.set(price, restoreLevel)
      })

      const buyerUserId = side === "BUY" ? userId : resting.userId;
      const sellerUserId = side === "BUY" ? resting.userId : userId;
      const buyOrderId = side === "BUY" ? incomingOrder._id : resting.orderId;
      const sellOrderId = side === "BUY" ? resting.orderId : incomingOrder._id;

      await settleBuyerFill(buyerUserId, stockId, amount, fillQty);
      compensation.push(`undo settleBuyerFill for ${buyerUserId}`, async () => {
        await undoSettleBuyerFill(buyerUserId, stockId, amount, fillQty)
      })

      await settleSellerFill(sellerUserId, stockId, amount, fillQty);
      compensation.push(`undo settleSellerFill for ${sellerUserId}`, async () => {
        await undoSettleSellerFill(sellerUserId, stockId, amount, fillQty)
      })

      // One Fill row per matched trade, at that trade's actual price
      const prevPrice = STOCK_STATS.get(stockId.toString())?.price;

      const newFill = await Fill.create({
        stockId,
        price,
        qty: fillQty,
        buyOrderId,
        sellOrderId
      });
      compensation.push(`delete fill ${newFill._id}`, async () => {
        await Fill.deleteOne({ _id: newFill._id })
      })

      const up = prevPrice !== undefined ? price >= prevPrice : true;

      const oppositeUser = await User.findById(resting.userId)

      pendingEvents.push(() => {
        const data = {
          stockId,
          userId,
          data: {
            price,
            qty: fillQty,
            time: newFill.createdAt.toISOString(),
            up
          }
        };
        io.emit('trade', data);
      })
      pendingEvents.push(() => publishEvent(EVENT_TYPES.TRADE_EXECUTED, oppositeUser._id, { email: oppositeUser.email, name: oppositeUser.firstName, tradeDetails: { type: side === 'BUY' ? 'SELL' : 'BUY', team: symbol, quantity: fillQty, price: price, totalAmount: amount } }))

      // Update stock stats per fill so high/low/volume reflect each price level swept
      const prevStats = STOCK_STATS.get(stockId.toString())
        ? { ...STOCK_STATS.get(stockId.toString()) }
        : null
      updateStockStats(stockId, price, fillQty);
      compensation.push(`revert stock stats for ${stockId}`, async () => {
        if (prevStats) STOCK_STATS.set(stockId.toString(), prevStats)
        else STOCK_STATS.delete(stockId.toString())
      })

      totalAmount += amount;
      filledQty += fillQty;
      remaining -= fillQty;
    }
  }

  const averagePrice =
    filledQty > 0 ? Number((totalAmount / filledQty).toFixed(2)) : null;

  const status =
    remaining === 0
      ? "CLOSED"
      : filledQty > 0
        ? "PARTIALLY_FILLED"
        : "CANCELLED";

  incomingOrder.filledQuantity = filledQty;
  incomingOrder.averagePrice = averagePrice;
  incomingOrder.status = status;
  await incomingOrder.save();
  compensation.push('revert incoming market order final state', async () => {
    await Order.updateOne(
      { _id: incomingOrder._id },
      { $set: { filledQuantity: 0, averagePrice: null, status: 'OPEN' } }
    )
  })

  pendingEvents.push(() => publishEvent(EVENT_TYPES.TRADE_EXECUTED, userId, { email: user.email, name: user.firstName, tradeDetails: { type: side, team: symbol, quantity: filledQty, price: averagePrice, totalAmount: totalAmount } }))

  // Unlock unsold shares for market sell
  if (side === "SELL" && remaining > 0) {
    await unlockSellQty(userId, stockId, remaining);
    compensation.push('re-lock market sell remainder', async () => {
      await lockSellQty(userId, stockId, remaining)
    })
  }

  return {
    filledQty,
    remainingQty: remaining,
    averagePrice,
    totalAmount,
    status,
    order: incomingOrder,
  };
}




export const executeOrder = async (req, res) => {
  console.log('Received order execution request:', req.body);
  const userId = req?.body?.userId;
  if (!userId) return res.status(401).json({ error: 'missing user id (x-user-id header or userId field)' })

  const sideText = typeof req.body?.side === 'string' ? req.body.side.toUpperCase() : ''
  const typeText = typeof req.body?.type === 'string' ? req.body.type.toUpperCase() : ''
  const qty = Number(req.body?.qty)
  const marketId = req.body?.market_id
  const rawPrice = req.body?.price

  const side = sideText
  const type = typeText
  const parsedPrice =
    rawPrice === null || rawPrice === undefined
      ? null
      : Number(rawPrice);

  const price =
    parsedPrice !== null && Number.isFinite(parsedPrice)
      ? Number((parsedPrice / 100).toFixed(2))
      : null;
  if (!['BUY', 'SELL'].includes(side)) return res.status(400).json({ error: 'side must be BUY or SELL' })
  if (!['LIMIT', 'MARKET'].includes(type)) return res.status(400).json({ error: 'type must be LIMIT or MARKET' })
  if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ error: 'qty must be a positive number' })
  if (type === 'LIMIT' && (price === null || price <= 0)) {
    return res.status(400).json({ error: 'price must be a positive number for limit orders' })
  }

  const user = await User.findById(userId)
  if (!user) return res.status(401).json({ error: 'invalid user' })

  const stock = await getStockByMarketId(marketId)
  if (!stock) return res.status(404).json({ error: 'market not found' })

  try {
    // Everything below runs serialized per-stock. Different stocks still
    // process concurrently; two orders for the SAME stock never interleave.
    const result = await enqueueForStock(stock._id, async () => {
      const compensation = new CompensationStack(`order:${userId}:${stock._id}`)
      const pendingEvents = []

      try {
        
        if (side === 'BUY') {
          if (type === 'LIMIT') {
            await lockBuyFunds(userId, price, qty)
            compensation.push('unlockBuyFunds', async () => {
              await unlockBuyFunds(userId, price * qty)
            })
          }
        } else {
          await lockSellQty(userId, stock._id, qty)
          compensation.push('unlockSellQty', async () => {
            await unlockSellQty(userId, stock._id, qty)
          })
        }

     
        const execResult = type === 'LIMIT'
          ? await limitOrderExecution(userId, side, stock._id, price, qty, compensation, pendingEvents)
          : await marketOrderExecution(userId, side, stock._id, qty, compensation, pendingEvents)

        // Everything committed cleanly — now fire the deferred events.
        for (const fireEvent of pendingEvents) {
          try { fireEvent() } catch (evErr) { console.error('event emit failed (non-fatal):', evErr) }
        }

        const stats = STOCK_STATS.get(stock._id.toString());
        const depth = getDepth(stock._id);
        if (stats) io.emit('stats', { id: stock._id, data: stats });
        if (depth) io.emit('depth', depth);

        return execResult
      } catch (err) {
        console.error('Error during order execution — rolling back:', err);
        await compensation.rollbackAll(err)
        throw err
      }
    })

    return res.status(201).json({
      message: `Successfully ordered ${marketId}  at ${type === 'LIMIT' ? price : result.averagePrice}.`,
      order: result.order,
      filledQty: result.filledQty,
      remainingQty: result.remainingQty,
      status:
        result.remainingQty === 0
          ? "CLOSED"
          : result.filledQty > 0
            ? "PARTIALLY_FILLED"
            : "OPEN",
    });
  } catch (err) {
    console.error('Error executing order:', err);
    return res.status(400).json({ message: 'Order could not be placed. Please try again.' })
  }
}
export const getOrderById = async (req, res) => {
  const id = req.params.orderId
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'invalid order id' })
  const order = await TradingOrder.findById(id).populate('stockId').lean()
  if (!order) return res.status(404).json({ error: 'order not found' })
  const fills = await Fill.find({ $or: [{ buyOrderId: id }, { sellOrderId: id }] }).sort({ createdAt: 1 })
  return res.json({ order, fills })
}

export const getStats = async (req, res) => {
  try {
    const stats = Array.from(STOCK_STATS.entries()).map(([id, data]) => ({
      id,
      data
    }));

    res.status(200).json(stats);
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ message: "Failed to fetch stock stats" });
  }
};

export const cancelOrderById = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      console.error('Missing user id');
      return res.status(401).json({ error: 'missing user id (x-user-id header or userId field)' })
    }
    const orderId = req.params.orderId
    if (!mongoose.isValidObjectId(orderId)) return res.status(400).json({ error: 'invalid order id' })
    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ error: 'order not found' })
    if (String(order.userId) !== String(userId)) return res.status(403).json({ error: 'you can only cancel your own order' })
    if (!['OPEN', 'PARTIALLY_FILLED'].includes(order.status)) return res.status(400).json({ error: 'only open/partially filled orders can be cancelled' })

    const remainingQty = order.qty - order.filledQty
    if (order.type === 'LIMIT' && order.side === 'BUY' && order.price != null && remainingQty > 0) {
      await unlockBuyFunds(userId, order.price * remainingQty)
    }
    if (order.type === 'LIMIT' && order.side === 'SELL' && remainingQty > 0) {
      await unlockSellQty(userId, order.stockId, remainingQty)
    }

    order.status = 'CANCELLED'
    await order.save()
    removeOrderFromBook(order)
    const depth = getDepth(order.stockId);

    if (depth) {
      io.emit('depth', depth);
    }



    return res.json({ orderId: order._id, status: 'CANCELLED' })
  } catch (err) {
    console.error('Error cancelling order:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'internal error' })
  }
}



export const getOrders = async (req, res) => {
  const userId = req.query.userId || getUserId(req)
  if (!userId) return res.status(401).json({ error: 'missing user id' })

  const { status, side } = req.query
  const from = parseInt(req.query.from) || 0
  const to = parseInt(req.query.to) || from + PAGE_SIZE
  const limit = Math.max(to - from, 0)

  const filter = { userId }
  if (status) filter.status = status
  if (side) filter.side = side.toUpperCase()

  const total = await Order.countDocuments(filter)
  const orders = await Order.find(filter)
    .populate('stockId', 'title symbol image price')
    .sort({ createdAt: -1 })
    .skip(from)
    .limit(limit)

  return res.json({ orders, from, to, hasMore: from + limit < total })
}

export const getHoldings = async (req, res) => {
  const userId = req.query.userId || getUserId(req)
  if (!userId) return res.status(401).json({ error: 'missing user id' })

  const { search, sortBy = 'currentValue', order = 'desc' } = req.query
  const userObjectId = new mongoose.Types.ObjectId(userId)

  const holdingsAgg = await StockBalance.aggregate([
    {
      $match: {
        userId: userObjectId,
        total: { $gt: 0 } 
      }
    },
    {
      $lookup: {
        from: 'stocks',
        localField: 'stockId',
        foreignField: '_id',
        as: 'stock'
      }
    },
    { $unwind: '$stock' },
    {
    
      $lookup: {
        from: 'orders',
        let: { stockId: '$stockId', userId: '$userId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$stockId', '$$stockId'] },
                  { $eq: ['$userId', '$$userId'] },
                  { $eq: ['$side', 'BUY'] },
                  { $gt: ['$filledQuantity', 0] }
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              buyQty: { $sum: '$filledQuantity' },
              buyAmount: { $sum: '$filledAmount' }
            }
          }
        ],
        as: 'buyStats'
      }
    },
    {
      $addFields: {
        buyQty: { $ifNull: [{ $arrayElemAt: ['$buyStats.buyQty', 0] }, 0] },
        buyAmount: { $ifNull: [{ $arrayElemAt: ['$buyStats.buyAmount', 0] }, 0] }
      }
    },
    {
      $addFields: {
        avgPrice: {
          $cond: [{ $gt: ['$buyQty', 0] }, { $divide: ['$buyAmount', '$buyQty'] }, 0]
        }
      }
    }
  ])

  let holdings = holdingsAgg.map(h => {
    const quantity = h.total
    const currentPrice = h.stock.price || 0
    const invested = quantity * h.avgPrice
    const currentValue = quantity * currentPrice
    const pnl = currentValue - invested
    const pnlPercent = invested ? (pnl / invested) * 100 : 0
    return {
      stockId: h.stockId,
      title: h.stock.title,
      symbol: h.stock.symbol,
      image: h.stock.image,
      quantity,
      locked: h.locked,
      available: quantity - h.locked,
      avgPrice: h.avgPrice,
      currentPrice,
      invested,
      currentValue,
      pnl,
      pnlPercent
    }
  })

  if (search) {
    const q = search.toLowerCase()
    holdings = holdings.filter(h =>
      h.title?.toLowerCase().includes(q) || h.symbol?.toLowerCase().includes(q)
    )
  }

  holdings.sort((a, b) => order === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy])

  return res.json({ holdings })
}

export const getTransactions = async (req, res) => {
  const userId = req.query.userId || getUserId(req)
  if (!userId) return res.status(401).json({ error: 'missing user id' })

  const { side, stockId, startDate, endDate } = req.query
  const from = parseInt(req.query.from) || 0
  const to = parseInt(req.query.to) || from + PAGE_SIZE
  const limit = Math.max(to - from, 0)

  const orderFilter = { userId }
  if (side) orderFilter.side = side.toUpperCase()
  if (stockId) orderFilter.stockId = stockId

  const userOrders = await Order.find(orderFilter).select('_id side')
  const orderIds = userOrders.map(o => o._id)
  const buyIds = new Set(userOrders.filter(o => o.side === 'BUY').map(o => String(o._id)))

  const fillFilter = { $or: [{ buyOrderId: { $in: orderIds } }, { sellOrderId: { $in: orderIds } }] }
  if (startDate || endDate) {
    fillFilter.createdAt = {}
    if (startDate) fillFilter.createdAt.$gte = new Date(startDate)
    if (endDate) fillFilter.createdAt.$lte = new Date(endDate)
  }

  const total = await Fill.countDocuments(fillFilter)
  const fills = await Fill.find(fillFilter)
    .populate('stockId', 'title symbol image price')
    .sort({ createdAt: -1 })
    .skip(from)
    .limit(limit)

  const transactions = fills.map(f => ({
    id: f._id,
    stockId: f.stockId?._id,
    title: f.stockId?.title,
    symbol: f.stockId?.symbol,
    image: f.stockId?.image,
    price: f.price,
    quantity: f.qty,
    amount: f.price * f.qty,
    type: buyIds.has(String(f.buyOrderId)) ? 'BUY' : 'SELL',
    date: f.createdAt
  }))

  return res.json({ transactions, from, to, hasMore: from + limit < total })
}


export const getFills = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'missing user id (x-user-id header or userId query)' })
  const fills = await Fill.find({ $or: [{}, {}] })
  // return fills where buyOrder or sellOrder belongs to user
  const userFills = await Fill.aggregate([
    { $lookup: { from: 'tradingorders', localField: 'buyOrderId', foreignField: '_id', as: 'buyOrder' } },
    { $lookup: { from: 'tradingorders', localField: 'sellOrderId', foreignField: '_id', as: 'sellOrder' } },
    { $match: { $or: [{ 'buyOrder.userId': mongoose.Types.ObjectId(userId) }, { 'sellOrder.userId': mongoose.Types.ObjectId(userId) }] } },
    { $sort: { createdAt: -1 } }
  ])
  return res.json({ fills: userFills })
}



export const getTrades = async (req, res) => {
  try {
    const { id } = req.params

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid or missing stock id' })
    }

    const trades = await Fill.find({ stockId: id })
      .sort({ createdAt: -1 })
      .limit(41) // fetch one extra so the oldest of the 20 still has a prior price to compare against
      .select('price qty createdAt')
      .lean()

    const withUp = trades.slice(0, 40).map((t, i) => {
      const prev = trades[i + 1]
      const up = prev ? t.price >= prev.price : true
      return {
        id: t._id,
        price: t.price,
        qty: t.qty,
        time: t.createdAt,
        up,
      }
    })

    return res.json({ id, trades: withUp })
  } catch (err) {
    console.error('getTrades error:', err)
    return res.status(500).json({ message: 'Failed to fetch trades' })
  }
}


export const getMyTrades = async (req, res) => {
  try {
    const { stockId, userId } = req.params



    if (!stockId || !mongoose.Types.ObjectId.isValid(stockId)) {
      return res.status(400).json({ message: 'Invalid or missing stock id' })
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }



    const trades = await Fill.find({ stockId })
      .sort({ createdAt: -1 })
      .populate({ path: 'buyOrderId', match: { userId }, select: 'userId' })
      .populate({ path: 'sellOrderId', match: { userId }, select: 'userId' })
      .select('price qty createdAt buyOrderId sellOrderId')
      .lean()

    const myTrades = trades
      .filter((t) => t.buyOrderId || t.sellOrderId)
      .slice(0, 20)
      .map((t) => ({
        id: t._id,
        price: t.price,
        qty: t.qty,
        time: t.createdAt,
        up: Boolean(t.sellOrderId),
      }))

    return res.json({ userId, myTrades })
  } catch (err) {
    console.error('getMyTrades error:', err)
    return res.status(500).json({ message: 'Failed to fetch my trades' })
  }
}

async function seedStocks() {
  console.log('Seeding initial stocks...');
  const cnt = await Stock.countDocuments()
  if (cnt > 0) return
  await Stock.create([{ title: 'Chennai Super Kings', symbol: 'CSK' }, { title: 'Mumbai Indians', symbol: 'MI' }, { title: 'Royal Challengers Bangalore', symbol: 'RCB' }, { title: 'Kolkata Knight Riders', symbol: 'KKR' }, { title: 'Delhi Capitals', symbol: 'DC' }, { title: 'Sunrisers Hyderabad', symbol: 'SRH' }, { title: 'Rajasthan Royals', symbol: 'RR' }, { title: 'Punjab Kings', symbol: 'PBKS' }, { title: 'Lucknow Super Giants', symbol: 'LSG' }, { title: 'Gujarat Titans', symbol: 'GT' }])
}


async function hydrateOrderBooks() {
  console.log('Hydrating order books from database...')
  const stocks = await Stock.find()
  for (const stock of stocks) {
    SYMBOL_BY_STOCK_ID.set(String(stock._id), stock.symbol)
    ensureBook(stock.symbol)
  }
  const openLimitOrders = await Order.find({ orderType: 'LIMIT', status: { $in: ['OPEN', 'PARTIALLY_FILLED'] } }).sort({ createdAt: 1 })
  console.log(openLimitOrders.length, 'open limit orders found in database.');
  for (const order of openLimitOrders) {
    addOrderToBook(order)

  }
}
// async function hydrateIPOs() {
//   const cnt = await IPO.countDocuments()
//   if (cnt > 0) return

//   const stocks = await Stock.find({}, "_id title symbol").lean()

//   const stockMap = Object.fromEntries(
//     stocks.map(stock => [stock.symbol, stock])
//   )

//   const openTime = new Date()
//   const closeTime = new Date(openTime)
//   closeTime.setMonth(closeTime.getMonth() + 1)

  

// }

export const initTrading = async () => {
  console.log('Initializing trading system...')
  await seedStocks()
  await hydrateOrderBooks()
  //await hydrateIPOs()
  await seedStockStats();

}