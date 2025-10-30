// backend/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { SwaggerTheme, SwaggerThemeNameEnum } = require('swagger-themes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from downloads directory
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Swagger Theme
const theme = new SwaggerTheme();
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
app.use('/api/settings', require('./routes/settings'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    status: 'error'
  });
});

// Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    status: 'error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
