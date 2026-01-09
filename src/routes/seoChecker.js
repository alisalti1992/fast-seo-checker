const express = require('express');
const router = express.Router();
const { checkSEO } = require('../services/seoChecker');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /seo-checker:
 *   get:
 *     summary: Perform SEO audit on a given URL
 *     tags: [SEO]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL to perform SEO audit on
 *         example: https://example.com
 *     responses:
 *       200:
 *         description: SEO audit results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *                 warnings:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Consider shortening title tag to avoid truncation"]
 *                 critical_issues:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Add an H1 tag to the page"]
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Add alt text to 5 images", "Add Open Graph tags for better social media sharing"]
 *       400:
 *         description: Missing or invalid URL parameter
 *       401:
 *         description: Missing API key
 *       403:
 *         description: Invalid API key
 */
router.get('/seo-checker', authMiddleware, async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      error: 'URL parameter is required'
    });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({
      error: 'Invalid URL format'
    });
  }

  try {
    const result = await checkSEO(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
