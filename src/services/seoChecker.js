const axios = require('axios');
const cheerio = require('cheerio');

async function checkSEO(url) {
  const result = {
    errors: [],
    warnings: [],
    critical_issues: [],
    recommendations: []
  };

  try {
    // Fetch the page with timeout for speed and follow redirects
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOChecker/1.0)'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Get the final URL after redirects
    const finalUrl = response.request.res.responseUrl || url;

    // Check title tag
    const title = $('title').text();
    if (!title) {
      result.critical_issues.push('Missing title tag');
    } else if (title.length > 60) {
      result.warnings.push('Consider shortening title tag to avoid truncation');
    } else if (title.length < 30) {
      result.recommendations.push('Consider lengthening title tag for better SEO');
    }

    // Check meta description
    const metaDescription = $('meta[name="description"]').attr('content');
    if (!metaDescription) {
      result.critical_issues.push('Missing meta description');
    } else if (metaDescription.length > 160) {
      result.warnings.push('Meta description is too long (may be truncated in search results)');
    } else if (metaDescription.length < 120) {
      result.recommendations.push('Consider lengthening meta description');
    }

    // Check H1 tags
    const h1Tags = $('h1');
    if (h1Tags.length === 0) {
      result.critical_issues.push('Add an H1 tag to the page');
    } else if (h1Tags.length > 1) {
      result.warnings.push(`Multiple H1 tags found (${h1Tags.length}). Consider using only one H1 per page`);
    }

    // Check images without alt text
    const images = $('img');
    const imagesWithoutAlt = images.filter((i, img) => !$(img).attr('alt')).length;
    if (imagesWithoutAlt > 0) {
      result.recommendations.push(`Add alt text to ${imagesWithoutAlt} image${imagesWithoutAlt > 1 ? 's' : ''}`);
    }

    // Check content length (more accurate word counting)
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(/\s+/).filter(word => word.length > 0).length;

    if (wordCount < 100) {
      result.critical_issues.push(`Content is too thin (${wordCount} words). Add more quality content (aim for 300+ words)`);
    } else if (wordCount < 300) {
      result.recommendations.push(`Increase content length (current: ${wordCount} words, aim for 300+ words)`);
    }

    // Check Open Graph tags
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDescription = $('meta[property="og:description"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');

    if (!ogTitle || !ogDescription || !ogImage) {
      result.recommendations.push('Add Open Graph tags for better social media sharing');
    }

    // Check canonical URL
    const canonical = $('link[rel="canonical"]').attr('href');
    if (!canonical) {
      result.recommendations.push('Add a canonical URL to avoid duplicate content issues');
    }

    // Check for HTTPS (check final URL after redirects)
    if (!finalUrl.startsWith('https://')) {
      result.warnings.push('Consider using HTTPS for better security and SEO');
    }

    // Check viewport meta tag
    const viewport = $('meta[name="viewport"]').attr('content');
    if (!viewport) {
      result.warnings.push('Missing viewport meta tag (important for mobile SEO)');
    }

    // Check meta robots tag
    const robots = $('meta[name="robots"]').attr('content');
    if (robots && (robots.includes('noindex') || robots.includes('nofollow'))) {
      result.warnings.push(`Page has restrictive robots meta tag: ${robots}`);
    }

    // Check for heading structure (H2-H6)
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;
    if (h1Tags.length > 0 && h2Count === 0) {
      result.recommendations.push('Add H2 subheadings to improve content structure');
    }

    // Check for broken internal links (href="#" or empty href)
    const brokenLinks = $('a[href="#"], a[href=""]').length;
    if (brokenLinks > 0) {
      result.warnings.push(`Found ${brokenLinks} link${brokenLinks > 1 ? 's' : ''} with empty or placeholder href`);
    }

    // Check for language attribute
    const htmlLang = $('html').attr('lang');
    if (!htmlLang) {
      result.recommendations.push('Add lang attribute to <html> tag for better accessibility and SEO');
    }

    // Check for meta charset
    const charset = $('meta[charset]').length > 0 || $('meta[http-equiv="Content-Type"]').length > 0;
    if (!charset) {
      result.warnings.push('Missing character encoding declaration (charset)');
    }

    // Check title-H1 alignment (they should be similar but not identical)
    if (title && h1Tags.length > 0) {
      const h1Text = h1Tags.first().text().trim();
      if (title.toLowerCase() === h1Text.toLowerCase()) {
        result.recommendations.push('Title and H1 are identical. Consider making them complementary instead');
      }
    }

    // Check for external links without rel attributes
    const externalLinksWithoutRel = $('a[href^="http"]').filter((i, link) => {
      const href = $(link).attr('href');
      const rel = $(link).attr('rel');
      return href && !href.includes(finalUrl.replace(/^https?:\/\//, '').split('/')[0]) && !rel;
    }).length;
    if (externalLinksWithoutRel > 0) {
      result.recommendations.push(`Consider adding rel="noopener" or rel="nofollow" to ${externalLinksWithoutRel} external link${externalLinksWithoutRel > 1 ? 's' : ''}`);
    }

    // Check for inline styles (bad for performance and SEO)
    const inlineStyles = $('[style]').length;
    if (inlineStyles > 20) {
      result.recommendations.push(`Found ${inlineStyles} elements with inline styles. Consider using external CSS`);
    }

    // Check for schema.org structured data
    const hasSchema = $('script[type="application/ld+json"]').length > 0 || $('[itemscope]').length > 0;
    if (!hasSchema) {
      result.recommendations.push('Add structured data (Schema.org) for better search visibility');
    }

    // Check for Twitter Card tags
    const twitterCard = $('meta[name="twitter:card"]').attr('content');
    if (!twitterCard) {
      result.recommendations.push('Add Twitter Card meta tags for better Twitter sharing');
    }

    // Check for favicon
    const favicon = $('link[rel="icon"], link[rel="shortcut icon"]').length > 0;
    if (!favicon) {
      result.recommendations.push('Add a favicon for better brand recognition');
    }

  } catch (error) {
    if (error.response) {
      result.errors.push(`Cannot access page: ${error.response.status} ${error.response.statusText || '<none>'}`);
    } else if (error.code === 'ECONNABORTED') {
      result.errors.push('Request timeout: Page took too long to respond');
    } else if (error.code === 'ENOTFOUND') {
      result.errors.push('Cannot access page: Domain not found');
    } else {
      result.errors.push(`Cannot access page: ${error.message}`);
    }
  }

  return result;
}

module.exports = { checkSEO };
