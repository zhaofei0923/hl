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

    // Sync database schema
    // - FORCE_SYNC=1 : drop & recreate all tables (dev only)
    // - Tables exist  : skip sync to prevent Sequelize from accumulating duplicate unique indexes
    // - Tables absent : create them via sync()
    if (process.env.FORCE_SYNC === '1' && process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ force: true });
      logger.info('Database tables recreated (FORCE_SYNC)');
    } else {
      const [[{ cnt }]] = await sequelize.query(
        "SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'"
      );
      if (Number(cnt) === 0) {
        await sequelize.sync();
        logger.info('Database tables created');
      } else {
        logger.info('Database tables already exist, skipping sync');
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
