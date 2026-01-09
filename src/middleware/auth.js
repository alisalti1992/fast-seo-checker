require('dotenv').config();

const authMiddleware = (req, res, next) => {
  // If API_KEY is not set in environment, skip authentication
  if (!process.env.API_KEY) {
    return next();
  }

  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key is required. Please provide X-API-Key header.'
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      error: 'Invalid API key'
    });
  }

  next();
};

module.exports = authMiddleware;
