/**
 * ============================================================================
 * Experiment 12: Node.js, Express.js, and EJS Templating
 * Main Application Entry Point
 * ============================================================================
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

// Internal Modules & Middleware
const requestLogger = require('./middleware/logger');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const { router: apiRouter } = require('./routes/apiRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Template Engine Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Core Middleware Pipeline
app.use(cors());
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 3. Global Template Variables & Helpers (available across all EJS views)
app.use((req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();
  res.locals.appVersion = '1.0.0';
  res.locals.nodeVersion = process.version;
  res.locals.currentPath = req.path;
  
  // Helper to format currency
  res.locals.formatCurrency = (amount) => {
    return Number(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  // Helper to format dates
  res.locals.formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  next();
});

// 4. Mount Application Routes
app.use('/api', apiRouter);     // RESTful JSON API endpoints
app.use('/', viewRouter);        // Server-side rendered EJS pages

// 5. Error Handling Middleware (must be registered last in the middleware stack)
app.use(notFoundHandler);
app.use(globalErrorHandler);

// 6. Start HTTP Server
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log('\n======================================================');
    console.log('🚀 EXP-12: Node.js, Express & EJS Laboratory Server');
    console.log('======================================================');
    console.log(`📡 Local Server URL:     http://localhost:${PORT}`);
    console.log(`📦 SSR Products Catalog: http://localhost:${PORT}/products`);
    console.log(`🧪 Interactive API Tool: http://localhost:${PORT}/api-explorer`);
    console.log(`🔄 Architecture Visual:  http://localhost:${PORT}/architecture`);
    console.log(`📖 Lab Experiment Manual:http://localhost:${PORT}/lab-manual`);
    console.log(`⚡ REST API Base:        http://localhost:${PORT}/api/products`);
    console.log(`⏱️  Node.js Runtime:     ${process.version} (${process.platform} ${process.arch})`);
    console.log('======================================================\n');
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed safely.');
    });
  });
}

module.exports = app;
