import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

// Import configurations and middleware
import connectDB from './config/database.js';
import { connectRedis } from './config/redis.js';
import { connectMailServer } from './config/Email.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import {startStockStatsFlusher} from './utils/stockStatService.js';


// Import routes
import authRoutes from './routes/authRoutes.js';
import kycRoutes from './routes/kycRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import currentMatchRoutes from './routes/currentMatchRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { initTrading } from './controllers/tradingController.js';
import tradingRoutes from './routes/tradingRoutes.js';
import ipoRoutes from './routes/ipoRoutes.js';

dotenv.config();


// Create Express app
const app = express();
const server = createServer(app);


const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
export {io};
io.on('connection', (socket) => {
  console.log('new user:', socket.id);

  socket.on('disconnect', (reason) => {
    console.log('user left:', socket.id, '| reason:', reason);
  });
});

// Connect to MongoDB
connectDB();
await connectRedis();

connectMailServer();

await initTrading();
startStockStatsFlusher();
// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Body parsing middleware
app.use(express.json());


// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});


app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/currentMatches', currentMatchRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/ipos', ipoRoutes);


// Health check endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the crixchange Platform API');
});
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Setup Socket.IO handlers

//setupSocketHandlers(io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;