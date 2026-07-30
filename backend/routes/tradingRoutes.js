import express from 'express'
import {getStocks,getStats,getTrades,getDepthBySymbol,executeOrder,getOrderById,cancelOrderById,getOrders,getFills,getMyTrades,getHoldings,getTransactions} from '../controllers/tradingController.js'

import { protect } from '../middleware/auth.js';

const router = express.Router()
router.post('/order',executeOrder)
router.get('/stocks',getStocks )
router.get('/stats',getStats);
router.get('/depth/:id',getDepthBySymbol )
router.get('/trades/:id',getTrades )
router.use(protect);
router.get('/myTrades/:stockId/:userId',getMyTrades);




router.get('/order/:orderId',getOrderById )

router.delete('/orders/:orderId/:userId',cancelOrderById )

router.get('/orders',getOrders )

router.get('/fills',getFills )

router.get('/holdings',getHoldings )

router.get('/transactions',getTransactions )


export default router;