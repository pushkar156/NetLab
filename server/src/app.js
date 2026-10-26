const express = require('express');
const cors = require('cors');
const { router: healthRouter } = require('./routes/health');
const clientsRouter = require('./routes/clients');
const networksRouter = require('./routes/networks');
const addressingRouter = require('./routes/addressing');
const simulationsRouter = require('./routes/simulations');
const logsRouter = require('./routes/logs');

const app = express();

// Request timing middleware
app.use((req, res, next) => {
  req._startTime = Date.now();
  next();
});

// Configure CORS for LAN accessibility and multi-device testing
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or direct IP hits)
    // or any localhost / LAN IP address
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '1mb' }));

// Mount API routes
app.use('/api', healthRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/networks', networksRouter);
app.use('/api/network-tools', addressingRouter);
app.use('/api/simulations', simulationsRouter);
app.use('/api/logs', logsRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized structured error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

module.exports = app;
