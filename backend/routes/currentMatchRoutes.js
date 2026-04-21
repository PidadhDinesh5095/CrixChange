import express from 'express';

import { asyncHandler } from '../middleware/errorMiddleware.js';
import { getCurrentMatches } from '../controllers/currentMatchController.js';
import { get } from 'mongoose';

const router=express.Router();


router.get('/today',asyncHandler(getCurrentMatches));

export default router;