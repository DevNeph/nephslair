require('dotenv').config();
const app = require('./app');
const { syncDatabase } = require('./models');

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Synchronize database and create tables
    await syncDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
      console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`📖 Custom Documentation: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
