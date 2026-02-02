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
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
//import { setupSocketHandlers } from './socket/socketHandlers.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
<<<<<<< HEAD
=======
import kycRoutes from './routes/kycRoutes.js';
>>>>>>> master
{/**import userRoutes from './routes/userRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import tradingRoutes from './routes/tradingRoutes.js';
import sportsRoutes from './routes/sportsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
<<<<<<< HEAD
import kycRoutes from './routes/kycRoutes.js';
=======

>>>>>>> master
import paymentRoutes from './routes/paymentRoutes.js';

// Load environment variables**/}
dotenv.config();
<<<<<<< HEAD
=======
console.log(process.env.FRONTEND_URL)
>>>>>>> master

// Create Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

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
<<<<<<< HEAD
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
=======
app.use(express.json());

>>>>>>> master

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
<<<<<<< HEAD
=======
app.use('/api/kyc', kycRoutes);
>>>>>>> master
// Remove this dummy GET route, it's not needed for registration
// app.get('/register',(req,res)=>{res.send("Hello")});
{/**
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/payments', paymentRoutes);**/}

// Health check endpoint
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