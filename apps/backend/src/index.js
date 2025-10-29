require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const { PORT, NODE_ENV } = require('./config/env');

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log(`✅ Server running in ${NODE_ENV} mode`);
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log('=================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.error(err.stack);
  
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});
