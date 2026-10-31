import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// 1. CORS Configuration (Properly sequenced before routes)
app.use(
  cors({
    origin: '*', // Allows cross-origin requests for hackathon frontend & testing
    credentials: true,
  })
);

// 2. Request Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root metadata route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Brightloop Software API',
    description: 'Subscription Management and Recurring Billing Platform',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      plans: '/api/plans',
      health: '/api/health',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Brightloop Software API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

// 3. Mount API Routes under /api
app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);

// 4. 404 Not Found Catch-All Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// 5. Centralized Error Handler Middleware (Properly placed last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Brightloop Backend running on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;
