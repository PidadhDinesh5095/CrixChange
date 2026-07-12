import express from 'express'
import {getStocks,getDepthBySymbol,executeOrder,getOrderById,cancelOrderById,getOrders,getFills} from '../controllers/tradingController.js'

import { protect } from '../middleware/auth.js';

const router = express.Router()
router.use(protect);




router.get('/stocks',getStocks )

router.get('/depth/:symbol',getDepthBySymbol )

router.post('/order',executeOrder)

router.get('/order/:orderId',getOrderById )

router.delete('/order/:orderId',cancelOrderById )

router.get('/orders',getOrders )

router.get('/fills',getFills )


export default router;
