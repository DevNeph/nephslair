'use strict';

require('dotenv').config();

const app = require('./app');
const { sequelize, syncDatabase } = require('./models');

const PORT = Number(process.env.PORT || 5000);

/**
 * Start HTTP server.
 * - In CI/tests we DO NOT call this file (NODE_ENV === 'test'), so no listen().
 * - Optionally run syncDatabase only when explicitly requested via DB_SYNC=true
 */
async function start() {
  // Only run sync if explicitly enabled (avoid interfering with migrations on CI)
  if (String(process.env.DB_SYNC).toLowerCase() === 'true') {
    console.log('🔄 DB_SYNC=true -> synchronizing database schema via Sequelize...');
    await syncDatabase();
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
  });

  return server;
}

/**
 * Gracefully stop server and close DB connection.
 */
async function stop(server) {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  // Close Sequelize connection so Jest doesn't hang
  await sequelize.close();
}

// Only start when not running tests
if (process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { start, stop };
