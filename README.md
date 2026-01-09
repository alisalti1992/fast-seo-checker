# Fast SEO Checker API

A fast and simple Node.js API for performing SEO audits on web pages. Built with Express, Swagger documentation, and API key authentication.

## Features

- **Fast SEO Analysis**: Quick SEO audit of any URL
- **Optional API Key Authentication**: Secure endpoints with API key validation (optional)
- **Swagger Documentation**: Interactive API documentation
- **Health Check**: Monitor service status
- **Comprehensive SEO Checks**: 20+ SEO factors analyzed in a single request

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. (Optional) Create a `.env` file for configuration:

```bash
cp .env.example .env
```

4. (Optional) Set your API key in the `.env` file to enable authentication:

```
API_KEY=your_secure_api_key_here
PORT=3000
```

**Note**: If you don't set an `API_KEY`, the API will run without authentication. This is useful for development or internal use.

## Usage

### Option 1: Run with Node.js

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

### Option 2: Run with Docker

Build and run the Docker container:

```bash
docker build -t fast-seo-checker .
docker run -p 3000:3000 fast-seo-checker
```

To enable authentication, pass the API key as an environment variable:

```bash
docker run -p 3000:3000 -e API_KEY=your_api_key_here fast-seo-checker
```

### API Documentation

Once the server is running, visit `http://localhost:3000/api-docs` to see the interactive Swagger documentation.

## Endpoints

### GET /health

Health check endpoint (no authentication required).

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-01-09T12:00:00.000Z"
}
```

### GET /seo-checker

Perform SEO audit on a given URL.

**Authentication**: Optional (only required if `API_KEY` is set in environment)

**Headers** (if authentication is enabled):
```
X-API-Key: your_api_key_here
```

**Parameters:**
- `url` (required): The URL to analyze

**Example Request (with authentication):**
```bash
curl -X GET "http://localhost:3000/seo-checker?url=https://example.com" \
  -H "X-API-Key: your_api_key_here"
```

**Example Request (without authentication):**
```bash
curl -X GET "http://localhost:3000/seo-checker?url=https://example.com"
```

**Example Response:**
```json
{
  "errors": [],
  "warnings": [
    "Consider shortening title tag to avoid truncation"
  ],
  "critical_issues": [
    "Add an H1 tag to the page"
  ],
  "recommendations": [
    "Add alt text to 5 images",
    "Add Open Graph tags for better social media sharing"
  ]
}
```

**Error Response (Cannot access page):**
```json
{
  "errors": [
    "Cannot access page: 522 <none>"
  ],
  "warnings": [],
  "critical_issues": [],
  "recommendations": []
}
```

## SEO Checks Performed

The API analyzes 20+ SEO factors including:

### Critical Checks
- **Title Tag**: Presence, length (30-60 characters recommended)
- **Meta Description**: Presence, length (120-160 characters recommended)
- **H1 Tag**: Presence and uniqueness
- **Content Length**: Word count analysis (flags thin content < 100 words)

### Technical SEO
- **HTTPS**: Checks final URL after following redirects
- **Canonical URL**: Duplicate content prevention
- **Meta Robots**: Detects noindex/nofollow tags
- **Charset Declaration**: Character encoding verification
- **Viewport Tag**: Mobile optimization

### Content Structure
- **Heading Hierarchy**: H1, H2, H3 structure analysis
- **Image Alt Text**: Missing alt attributes detection
- **Broken Links**: Empty or placeholder href detection
- **Title-H1 Alignment**: Checks for optimal differentiation

### Social & Metadata
- **Open Graph Tags**: Facebook/social media sharing (og:title, og:description, og:image)
- **Twitter Cards**: Twitter sharing optimization
- **Favicon**: Brand recognition element

### Best Practices
- **Language Attribute**: HTML lang attribute for accessibility
- **External Links**: rel attribute recommendations (noopener, nofollow)
- **Inline Styles**: Excessive inline CSS detection
- **Structured Data**: Schema.org markup detection

All checks are performed in a single request with no additional HTTP calls, ensuring fast analysis.

## Environment Variables

- `API_KEY`: Your API key for authentication (optional - leave empty to disable authentication)
- `PORT`: Server port (optional - defaults to 3000 if not set)

### Authentication Behavior

- **API_KEY is set**: All requests to `/seo-checker` must include `X-API-Key` header
- **API_KEY is NOT set**: No authentication required, all requests allowed
- `/health` endpoint never requires authentication

## Technologies

- **Express**: Web framework
- **Axios**: HTTP client for fetching pages
- **Cheerio**: HTML parsing and analysis
- **Swagger**: API documentation
- **dotenv**: Environment configuration

## License

ISC
