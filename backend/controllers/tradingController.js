
import Order from '../models/Order.js'
import Wallet from '../models/Wallet.js'
import Stock from '../models/Stock.js'
import StockBalance from '../models/StockBalance.js'

const INR_CURRENCY = 'INR'

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
  if (order.type !== 'LIMIT' || order.price == null) return
  const remainingQty = order.qty - order.filledQty
  if (remainingQty <= 0) return
  const symbol = SYMBOL_BY_STOCK_ID.get(String(order.stockId))
  if (!symbol) return
  const book = ensureBook(symbol)
  const sideMap = getSideMap(book, order.side)
  const level = sideMap.get(order.price) ?? { totalQty: 0, orders: [] }
  level.totalQty += remainingQty
  level.orders.push({ orderId: String(order._id), userId: String(order.userId), qty: order.qty, filledQty: order.filledQty, createdAt: order.createdAt.toISOString() })
  sideMap.set(order.price, level)
}

function reduceOrderFromBook(order, reductionQty) {
  if (order.price == null || reductionQty <= 0) return
  const symbol = SYMBOL_BY_STOCK_ID.get(String(order.stockId))
  if (!symbol) return
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
  const remainingQty = order.qty - order.filledQty
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

function getDepth(symbol) {
  const normalized = symbol.toUpperCase()
  const book = ORDERBOOKS.get(normalized)
  if (!book) return { bids: {}, asks: {} }
  const bids = Object.fromEntries([...book.bids.entries()].sort((a, b) => b[0] - a[0]).map(([price, level]) => [String(price), { totalQty: level.totalQty, orders: level.orders }]))
  const asks = Object.fromEntries([...book.asks.entries()].sort((a, b) => a[0] - b[0]).map(([price, level]) => [String(price), { totalQty: level.totalQty, orders: level.orders }]))
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
  existing = await Wallet.create({ userId, currency: INR, balance: 0, frozenBalance: 0 })
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
  if (cash.total < amount) throw new Error('Insufficient INR balance for buy LIMIT order')
  cash.total -= amount
  cash.locked += amount
  await cash.save()
}

async function unlockBuyFunds(userId, amount) {
  if (amount <= 0) return
  const cash = await ensureCashBalance(userId)
  cash.total += amount
  cash.locked = Math.max(0, cash.locked - amount)
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
  const stocks = await Stock.find().sort({ _id: 1 })
  return res.json({ stocks })
}
export const getDepthBySymbol = async (req, res) => {
  const symbol = String(req.params.symbol).toUpperCase()
  return res.json({ symbol, depth: getDepth(symbol) })
}
// Buyer's side of a fill: the wallet funds were already frozen (either
// upfront via lockBuyFunds for LIMIT, or right before this call via
// freezeAmount for MARKET — see marketOrderExecution). This call finalizes
// that reservation into an actual spend, and credits the stock to the buyer.
async function settleBuyerFill(userId, stockId, amount, qty) {
  const wallet = await Wallet.findOne({ userId })
  await wallet.debitFrozen(amount, `Buy settlement: ${qty} unit(s) of stock ${stockId}`)

  const stockBal = await ensureStockBalance(userId, stockId)
  stockBal.total += qty // buyer now owns this quantity outright
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

  const wallet = await Wallet.findOne({ userId })
  await wallet.credit(amount, `Sell settlement: ${qty} unit(s) of stock ${stockId}`)
}


async function limitOrderExecution(userId, side, stockId, price, qty) {
  const opposingSide = side === 'BUY' ? 'SELL' : 'BUY'
  if (qty <= 0) return
  const symbol = SYMBOL_BY_STOCK_ID.get(String(stockId))
  if (!symbol) return
  const book = ensureBook(symbol)
  const sideMap = getSideMap(book, opposingSide)
  const level = sideMap.get(price)

  if (!level) {
    const incomingOrder = await Order.create({
      userId, side, orderType: 'LIMIT', stockId, price,
      quantity: qty, filledQuantity: 0, status: 'OPEN'
    })
    addOrderToBook(incomingOrder)
    return { filledQty: 0, remainingQty: qty, orderId: incomingOrder._id }
  }

  let remaining = qty
  const restingOrders = [...level.orders]

  for (const resting of restingOrders) {
    if (remaining <= 0 || resting.status === 'CLOSED') break

    const restingRemaining = resting.qty - resting.filledQty
    if (restingRemaining <= 0) continue

    const fillQty = Math.min(remaining, restingRemaining)
    const amount = price * fillQty

    const oppositeOrder = await Order.findById(resting.orderId)
    if (!oppositeOrder) continue

    oppositeOrder.filledQuantity += fillQty
    oppositeOrder.status = oppositeOrder.filledQuantity >= oppositeOrder.quantity ? 'CLOSED' : 'OPEN'
    await oppositeOrder.save()

    reduceOrderFromBook({ price, side: opposingSide, id: resting.orderId }, fillQty)

    // Settle both sides of this fill — this is where funds/stock actually transfer.
    const buyerUserId = side === 'BUY' ? userId : resting.userId
    const sellerUserId = side === 'BUY' ? resting.userId : userId
    await settleBuyerFill(buyerUserId, stockId, amount, fillQty)
    await settleSellerFill(sellerUserId, stockId, amount, fillQty)

    remaining -= fillQty
  }

  const filledQty = qty - remaining
  const status = remaining <= 0 ? 'CLOSED' : 'OPEN'

  const incomingOrder = await Order.create({
    userId, side, orderType: 'LIMIT', stockId, price,
    quantity: qty, filledQuantity: filledQty, status
  })

  if (remaining > 0) addOrderToBook(incomingOrder)

  return { filledQty, remainingQty: remaining, orderId: incomingOrder._id }
  // Note: no unlock here. The incoming order's unfilled remainder stays
  // locked/frozen because it's still reserved for the resting portion.
}

async function marketOrderExecution(userId, side, stockId, qty) {
  if (qty <= 0) return
  const opposingSide = side === 'BUY' ? 'SELL' : 'BUY'
  const symbol = SYMBOL_BY_STOCK_ID.get(String(stockId))
  if (!symbol) return
  const book = ensureBook(symbol)
  const sideMap = getSideMap(book, opposingSide)

  let remaining = qty
  const sortedPrices = [...sideMap.keys()].sort((a, b) => (side === 'BUY' ? a - b : b - a))

  outer:
  for (const price of sortedPrices) {
    if (remaining <= 0) break
    const level = sideMap.get(price)
    if (!level) continue

    const restingOrders = [...level.orders]

    for (const resting of restingOrders) {
      if (remaining <= 0) break

      const restingRemaining = resting.qty - resting.filledQty
      if (restingRemaining <= 0) continue

      const fillQty = Math.min(remaining, restingRemaining)
      const amount = price * fillQty

      // Market BUY was never pre-locked (price unknown at submit time).
      // Check + freeze right before settling this specific fill.
      if (side === 'BUY') {
        const wallet = await Wallet.findOne({ userId })
        if (wallet.availableBalance < amount) break outer // can't afford this or any worse price
        await wallet.freezeAmount(amount)
      }

      const oppositeOrder = await Order.findById(resting.orderId)
      if (!oppositeOrder) continue

      oppositeOrder.filledQuantity += fillQty
      oppositeOrder.status = oppositeOrder.filledQuantity >= oppositeOrder.quantity ? 'CLOSED' : 'OPEN'
      await oppositeOrder.save()

      reduceOrderFromBook({ price, side: opposingSide, id: resting.orderId }, fillQty)

      const buyerUserId = side === 'BUY' ? userId : resting.userId
      const sellerUserId = side === 'BUY' ? resting.userId : userId
      await settleBuyerFill(buyerUserId, stockId, amount, fillQty)
      await settleSellerFill(sellerUserId, stockId, amount, fillQty)

      remaining -= fillQty
    }
  }

  const filledQty = qty - remaining
  const status = remaining <= 0 ? 'CLOSED' : filledQty > 0 ? 'PARTIALLY_FILLED' : 'CANCELLED'

  await Order.create({
    userId, side, orderType: 'MARKET', stockId, price: null,
    quantity: qty, filledQuantity: filledQty, status
  })

  // Market SELL locked full qty upfront in executeOrder; give back what didn't sell.
  if (side === 'SELL' && remaining > 0) {
    await unlockSellQty(userId, stockId, remaining)
  }
  // Market BUY: nothing to unlock — we only ever froze what actually got matched.

  return { filledQty, remainingQty: remaining }
}




export const executeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ error: 'missing user id (x-user-id header or userId field)' })

    const sideText = typeof req.body?.side === 'string' ? req.body.side.toUpperCase() : ''
    const typeText = typeof req.body?.type === 'string' ? req.body.type.toUpperCase() : ''
    const qty = Number(req.body?.qty)
    const marketId = req.body?.market_id
    const rawPrice = req.body?.price

    const side = sideText
    const type = typeText
    const parsedPrice = rawPrice === null || rawPrice === undefined ? null : Number(rawPrice)
    const price = parsedPrice !== null && Number.isFinite(parsedPrice) ? parsedPrice : null

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

    // ── Reserve funds/stock upfront where the amount is known in advance ──
    // Market BUY is the one case with no upfront number to lock (price unknown
    // until matching happens), so it's handled per-fill inside marketOrderExecution.
    let locked = null

    if (side === 'BUY') {
      if (type === 'LIMIT') {
        await lockBuyFunds(userId, price, qty)
        locked = { kind: 'BUY', amount: price * qty }
      }
    } else {
      await lockSellQty(userId, stock._id, qty)
      locked = { kind: 'SELL', qty }
    }

    // ── Run the actual match against the in-memory book. This single call
    // already handles: creating the Order record, matching, settling both
    // sides' wallets/stock balances, and resting any unfilled remainder. ──
    let result
    try {
      result = type === 'LIMIT'
        ? await limitOrderExecution(userId, side, stock._id, price, qty)
        : await marketOrderExecution(userId, side, stock._id, qty)
    } catch (matchErr) {
      // Matching failed after we'd already locked funds/stock — give it back.
      if (locked?.kind === 'BUY') await unlockBuyFunds(userId, locked.amount)
      if (locked?.kind === 'SELL') await unlockSellQty(userId, stock._id, locked.qty)
      throw matchErr
    }

    // ── Refund the unused portion of a locked LIMIT BUY reservation ──
    // (limit SELL doesn't need this: sell locks exact qty, and any unfilled
    // qty just stays resting on the book — nothing extra was over-reserved.)
    if (type === 'LIMIT' && side === 'BUY' && result.filledQty > 0) {
      const unusedReservation = price * result.remainingQty
      // remainingQty here means "still resting on book", not refundable —
      // only refund if the order didn't rest at all (fully filled) or was
      // for less than originally locked due to a partial-fill-then-rest case.
      // Since lockBuyFunds locked price*qty and settlement already consumed
      // exactly price*filledQty via debitFrozen, nothing further is owed here
      // unless you cancel the resting remainder later.
    }

    return res.status(201).json({
      orderId: result.orderId,
      filledQty: result.filledQty,
      remainingQty: result.remainingQty,
      status: result.remainingQty === 0 ? 'CLOSED' : result.filledQty > 0 ? 'PARTIALLY_FILLED' : 'OPEN'
    })
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'internal error' })
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

export const cancelOrderById = async (req, res) => {
  try {
    const userId = req.user.id
    if (!userId) return res.status(401).json({ error: 'missing user id (x-user-id header or userId field)' })
    const orderId = req.params.orderId
    if (!mongoose.isValidObjectId(orderId)) return res.status(400).json({ error: 'invalid order id' })
    const order = await TradingOrder.findById(orderId)
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

    return res.json({ orderId: order._id, status: 'CANCELLED' })
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'internal error' })
  }
}

export const getOrders = async (req, res) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'missing user id (x-user-id header or userId query)' })
  const orders = await TradingOrder.find({ userId }).populate('stockId').sort({ createdAt: -1 })
  return res.json({ orders })
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

async function seedStocks() {
  const cnt = await Stock.countDocuments()
  if (cnt > 0) return
  await Stock.create([{ title: 'Chennai Super Kings', symbol: 'CSK' }, { title: 'Mumbai Indians', symbol: 'MI' }, { title: 'Royal Challengers Bangalore', symbol: 'RCB' }, { title: 'Kolkata Knight Riders', symbol: 'KKR' }, { title: 'Delhi Capitals', symbol: 'DC' }, { title: 'Sunrisers Hyderabad', symbol: 'SRH' }, { title: 'Rajasthan Royals', symbol: 'RR' }, { title: 'Punjab Kings', symbol: 'PBKS' }, { title: 'Lucknow Super Giants', symbol: 'LSG' }, { title: 'Gujarat Titans', symbol: 'GT' }])
}

async function hydrateOrderBooks() {
  const stocks = await Stock.find()
  for (const stock of stocks) {
    SYMBOL_BY_STOCK_ID.set(String(stock._id), stock.symbol)
    ensureBook(stock.symbol)
  }
  const openLimitOrders = await Order.find({ type: 'LIMIT', status: { $in: ['OPEN', 'PARTIALLY_FILLED'] } }).sort({ createdAt: 1 })
  for (const order of openLimitOrders) addOrderToBook(order)
}

export const initTrading = async () => {
  await seedStocks()
  await hydrateOrderBooks()
}