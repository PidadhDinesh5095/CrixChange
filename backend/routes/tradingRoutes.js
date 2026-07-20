import express from 'express'
import {getStocks,getDepthBySymbol,executeOrder,getOrderById,cancelOrderById,getOrders,getFills} from '../controllers/tradingController.js'

import { protect } from '../middleware/auth.js';

const router = express.Router()
router.post('/order',executeOrder)
router.get('/stocks',getStocks )
router.use(protect);

router.get('/depth/:symbol',getDepthBySymbol )



router.get('/order/:orderId',getOrderById )

router.delete('/order/:orderId',cancelOrderById )

router.get('/orders',getOrders )

router.get('/fills',getFills )


export default router;
