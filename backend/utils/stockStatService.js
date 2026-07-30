import Stock from '../models/Stock.js';

 const STOCK_STATS = new Map();

/**
 * 1. SEED — load DB into memory, and store a snapshot of what's
 * currently in the DB so we can diff against it later.
 */
 async function seedStockStats() {
  const stocks = await Stock.find({}, '_id price open high low volume change changePercent');

  for (const stock of stocks) {
    const openPrice = stock.open ?? stock.price;

    const current = {
      price: stock.price,
      open: openPrice,
      high: stock.high ?? stock.price,
      low: stock.low ?? stock.price,
      volume: stock.volume ?? 0,
      change: stock.change ?? (stock.price - openPrice),
      changePercent: stock.changePercent ?? (openPrice ? ((stock.price - openPrice) / openPrice) * 100 : 0),
    };

    STOCK_STATS.set(stock._id.toString(), {
      ...current,
      lastFlushed: { ...current }, // snapshot of last known DB state
    });
  }

  console.log(`Seeded ${stocks.length} stocks into memory`);
}

/**
 * 2. UPDATE — pure in-memory, called on every trade. No dirty flag needed here anymore.
 */
function updateStockStats(stockId, tradePrice, tradeQty) {
  let stats = STOCK_STATS.get(String(stockId));

  if (!stats) {
    const fresh = {
      price: tradePrice,
      open: tradePrice,
      high: tradePrice,
      low: tradePrice,
      volume: 0,
      change: 0,
      changePercent: 0,
    };
    stats = { ...fresh, lastFlushed: { ...fresh } };
    STOCK_STATS.set(stockId, stats);
  }

  stats.price = tradePrice;
  stats.high = Math.max(stats.high, tradePrice);
  stats.low = Math.min(stats.low, tradePrice);
  stats.volume += tradeQty;
  stats.change = stats.price - stats.open;
  stats.changePercent = stats.open ? (stats.change / stats.open) * 100 : 0;
  return stats;
}

/**
 * Helper — compares current values against the last-flushed snapshot.
 */
function hasChanged(stats) {
  const prev = stats.lastFlushed;
  return (
    stats.price !== prev.price ||
    stats.high !== prev.high ||
    stats.low !== prev.low ||
    stats.volume !== prev.volume ||
    stats.change !== prev.change ||
    stats.changePercent !== prev.changePercent
  );
}

/**
 * 3. FLUSH — every 5 min, only push stocks whose values actually
 * differ from what's already stored in the DB.
 */
async function flushStockStatsToDB() {
  const bulkOps = [];

  for (const [stockId, stats] of STOCK_STATS.entries()) {
    if (!hasChanged(stats)) continue; // skip unchanged stocks entirely

    bulkOps.push({
      updateOne: {
        filter: { _id: stockId },
        update: {
          $set: {
            price: stats.price,
            high: stats.high,
            low: stats.low,
            volume: stats.volume,
            change: stats.change,
            changePercent: stats.changePercent,
          },
        },
      },
    });

    // update the snapshot to match what we just persisted
    stats.lastFlushed = {
      price: stats.price,
      open: stats.open,
      high: stats.high,
      low: stats.low,
      volume: stats.volume,
      change: stats.change,
      changePercent: stats.changePercent,
    };
  }

  if (bulkOps.length > 0) {
    await Stock.bulkWrite(bulkOps);
    console.log(`Flushed ${bulkOps.length} changed stock(s) to DB`);
  } else {
    console.log('No changes to flush');
  }
}

function startStockStatsFlusher(intervalMs = 5 * 60 * 1000) {
  setInterval(() => {
    flushStockStatsToDB().catch(err => console.error('Flush failed:', err));
  }, intervalMs);
}

export {
  STOCK_STATS,
  seedStockStats,
  updateStockStats,
  flushStockStatsToDB,
  startStockStatsFlusher,
};