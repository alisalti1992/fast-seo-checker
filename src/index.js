require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const healthRoute = require('./routes/health');
const seoCheckerRoute = require('./routes/seoChecker');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/', healthRoute);
app.use('/', seoCheckerRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'Please check the API documentation at /api-docs'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);

  if (!process.env.API_KEY) {
    console.log('\nWARNING: API_KEY not set in environment. Authentication is DISABLED.');
    console.log('Set API_KEY in .env file to enable API key authentication.\n');
  } else {
    console.log('\nAPI key authentication is ENABLED\n');
  }
});
