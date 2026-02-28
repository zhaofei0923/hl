require('dotenv').config();

const app = require('./app');
const sequelize = require('./config/database');
const logger = require('./utils/logger');

// Import models to register associations
require('./models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync database (create tables if they don't exist)
    // In production, use migrations instead
    if (process.env.NODE_ENV !== 'production') {
      // Use plain sync (creates missing tables only).
      // alter:true causes duplicate index accumulation in MySQL.
      // For schema changes, use migrations or set FORCE_SYNC=1 to recreate all tables.
      if (process.env.FORCE_SYNC === '1') {
        await sequelize.sync({ force: true });
        logger.info('Database tables recreated (FORCE_SYNC)');
      } else {
        await sequelize.sync();
        logger.info('Database models synchronized');
      }
    }

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API base URL: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

startServer();
