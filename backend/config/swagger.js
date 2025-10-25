const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nephslair API',
      version: '1.0.0',
      contact: {
        name: 'Neph',
        email: 'support@nephslair.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Projects',
        description: 'Project management endpoints'
      },
      {
        name: 'Posts',
        description: 'Post management endpoints'
      },
      {
        name: 'Comments',
        description: 'Comment management endpoints'
      },
      {
        name: 'Votes',
        description: 'Voting system endpoints'
      },
      {
        name: 'Polls',
        description: 'Poll management endpoints'
      },
      {
        name: 'Downloads',
        description: 'File download endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      }
    ]
  },
  apis: ['./routes/*.js'] // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;