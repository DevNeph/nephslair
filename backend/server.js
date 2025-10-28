const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { SwaggerTheme, SwaggerThemeNameEnum } = require('swagger-themes');

const { syncDatabase } = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from downloads directory
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Swagger Theme
const theme = new SwaggerTheme();

// Available themes:
// - SwaggerThemeNameEnum.DARK
// - SwaggerThemeNameEnum.MONOKAI
// - SwaggerThemeNameEnum.NEWSPAPER
// - SwaggerThemeNameEnum.OUTLINE
// - SwaggerThemeNameEnum.FEELING_BLUE
// - SwaggerThemeNameEnum.FLATTOP
// - SwaggerThemeNameEnum.MATERIAL
// - SwaggerThemeNameEnum.MUTED

const darkStyle = theme.getBuffer(SwaggerThemeNameEnum.DARK);

// Swagger Documentation with Dark Theme
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: darkStyle,
  customSiteTitle: 'Nephslair API Docs',
  customfavIcon: 'https://swagger.io/favicon.ico'
}));

// Test Route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Nephslair API is running!',
    status: 'success',
    documentation: '/api-docs'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/polls', require('./routes/polls'));
app.use('/api/releases', require('./routes/releases'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/users', require('./routes/users'));


// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    status: 'error'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    status: 'error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

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