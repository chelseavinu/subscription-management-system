import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 3. Mount Central API Routes at /api
app.use('/api', apiRoutes);

// 4. Static Client Serving if built
const clientDistPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root route fallback if client not built
  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'Brightloop Software API',
      description: 'Subscription Management and Recurring Billing Platform',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        products: '/api/products',
        plans: '/api/plans',
        subscriptions: '/api/subscriptions',
        invoices: '/api/invoices',
        payments: '/api/payments',
        quotationTemplates: '/api/quotation-templates',
        sales: '/api/sales',
        customers: '/api/customers',
        analytics: '/api/analytics/dashboard',
        health: '/api/health',
      },
    });
  });
}

// 5. 404 Catch-All Handler (invoked only when no mounted route matches)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// 6. Centralized Error Handler Middleware (Properly placed last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Brightloop Application running on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
  console.log(`🌍 Client URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[Server] Port ${PORT} is already bound by an active process.`);
  } else {
    throw err;
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;
