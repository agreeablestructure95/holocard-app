import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
// import rateLimit from 'express-rate-limit'; // DISABLED for development
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import cardRoutes from './routes/card.js';
import uploadRoutes from './routes/upload.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting - DISABLED for development
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
//   max: process.env.NODE_ENV === 'development' ? 1000 : (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100),
//   message: {
//     error: 'Too many requests from this IP, please try again later.',
//   },
//   skip: (req) => {
//     // Skip rate limiting for development on localhost
//     if (process.env.NODE_ENV === 'development' && 
//         (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip.includes('localhost'))) {
//       return true;
//     }
//     return false;
//   }
// });

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https:"],
    },
  },
}));

// CORS configuration - Allow frontend on port 3000
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Apply rate limiting - DISABLED for development
// app.use('/api', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/card', cardRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HoloCard Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
