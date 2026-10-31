const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas / Database
connectDB();

// Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve Embedded Control Center / Test UI for Evaluators & Teammates
app.use(express.static(path.join(__dirname, 'public')));

// Mount API Endpoints
app.use('/api', apiRoutes);

// Root fallback to serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 Handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`
  });
});

// Centralized Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Brightloop Subscription & Billing Automation Engine `);
  console.log(` Role: Member 2 (Backend Logic & Engine)             `);
  console.log(` Server running on: http://localhost:${PORT}         `);
  console.log(` API Base URL:       http://localhost:${PORT}/api     `);
  console.log(` Control Center:     http://localhost:${PORT}         `);
  console.log(`====================================================`);
});

module.exports = { app, server };
