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

// 4. Mount Member 4: Admin & Finance Hub at /admin
const adminDistPath = path.join(__dirname, 'admin-finance', 'dist');
if (fs.existsSync(adminDistPath)) {
  app.use('/admin', express.static(adminDistPath));
  app.get('/admin*', (req, res) => {
    res.sendFile(path.join(adminDistPath, 'index.html'));
  });
}

// 5. Mount Member 2: Billing Engine Control Center at /engine
const enginePath = path.join(__dirname, 'src', 'public');
if (fs.existsSync(enginePath)) {
  app.use('/engine', express.static(enginePath));
  app.get('/engine*', (req, res) => {
    res.sendFile(path.join(enginePath, 'index.html'));
  });
}

// 6. Mount Member 3: Unified Customer & Sales Portal Client at /
const clientDistPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (
      req.originalUrl.startsWith('/api') ||
      req.originalUrl.startsWith('/admin') ||
      req.originalUrl.startsWith('/engine')
    ) {
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

// 5. 404 Not Found Catch-All Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
});

// Fallback 404
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
  console.log(`🚀 Brightloop Unified Platform running on PORT ${PORT}`);
  console.log(`🌐 1. Customer & Sales Portal:  http://localhost:${PORT}/`);
  console.log(`👑 2. Admin & Finance Hub:      http://localhost:${PORT}/admin`);
  console.log(`⚡ 3. Billing Engine & Logic:   http://localhost:${PORT}/engine`);
  console.log(`📡 4. Central REST API Base:    http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`📡 Port ${PORT} already active, connected to existing server.`);
  } else {
    console.error(`Server listen error: ${err.message}`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;
