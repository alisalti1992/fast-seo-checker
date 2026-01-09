require('dotenv').config();
const swaggerJsdoc = require('swagger-jsdoc');

const APP_URL = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fast SEO Checker API',
      version: '1.0.0',
      description: 'A fast and simple API for checking SEO metrics of web pages',
    },
    servers: [
      {
        url: APP_URL,
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
