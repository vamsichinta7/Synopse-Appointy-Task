const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Web Search Service
 * Performs web searches and scrapes results
 */

/**
 * Search the web using DuckDuckGo HTML scraping
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} Array of search results
 */
async function searchWeb(query, limit = 10) {
  try {
    // Use DuckDuckGo HTML version for scraping
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Parse DuckDuckGo results
    $('.result').each((index, element) => {
      if (results.length >= limit) return false;

      const $result = $(element);
      const title = $result.find('.result__a').text().trim();
      const link = $result.find('.result__a').attr('href');
      const snippet = $result.find('.result__snippet').text().trim();

      if (title && link) {
        results.push({
          title,
          url: link,
          snippet,
          source: 'web',
          favicon: getFaviconUrl(link)
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Web search error:', error.message);
    return [];
  }
}

/**
 * Search for shopping/products using web search
 * @param {string} query - Product search query
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Array of product results
 */
async function searchProducts(query, limit = 10) {
  try {
    // Enhance query for shopping
    const productQuery = `${query} buy online shop`;

    const results = await searchWeb(productQuery, limit * 2);

    // Filter and enhance for shopping results
    const productResults = results
      .filter(result => {
        const lowerUrl = result.url.toLowerCase();
        const lowerTitle = result.title.toLowerCase();
        return (
          lowerUrl.includes('amazon') ||
          lowerUrl.includes('flipkart') ||
          lowerUrl.includes('shop') ||
          lowerUrl.includes('buy') ||
          lowerUrl.includes('product') ||
          lowerTitle.includes('price') ||
          lowerTitle.includes('buy')
        );
      })
      .slice(0, limit)
      .map(result => ({
        ...result,
        type: 'product'
      }));

    return productResults;
  } catch (error) {
    console.error('Product search error:', error.message);
    return [];
  }
}

/**
 * Enhanced web search with Claude AI analysis
 * @param {string} query - Search query
 * @param {string} searchType - Type of search (general, products, news)
 * @returns {Promise<Object>} Structured search results
 */
async function enhancedWebSearch(query, searchType = 'general') {
  try {
    let results = [];

    if (searchType === 'products' || query.toLowerCase().includes('buy') ||
        query.toLowerCase().includes('shop') || query.toLowerCase().includes('price') ||
        query.match(/\d+\s*(rupees|rs|inr|dollars|\$)/i)) {
      // Product search
      results = await searchProducts(query, 10);
    } else {
      // General web search
      results = await searchWeb(query, 10);
    }

    return {
      query,
      searchType,
      results,
      timestamp: new Date().toISOString(),
      count: results.length
    };
  } catch (error) {
    console.error('Enhanced web search error:', error);
    return {
      query,
      searchType,
      results: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: error.message
    };
  }
}

/**
 * Get favicon URL for a domain
 * @param {string} url - Website URL
 * @returns {string} Favicon URL
 */
function getFaviconUrl(url) {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch (error) {
    return null;
  }
}

/**
 * Determine if query should trigger web search
 * @param {string} query - Search query
 * @param {number} fileResultsCount - Number of results from uploaded files
 * @returns {boolean} Whether to perform web search
 */
function shouldPerformWebSearch(query, fileResultsCount) {
  // Always search web if no file results
  if (fileResultsCount === 0) return true;

  // Search web for shopping queries
  const shoppingKeywords = ['buy', 'shop', 'price', 'purchase', 'order', 'rupees', 'rs', 'inr', 'dollars', '$'];
  const hasShoppingKeyword = shoppingKeywords.some(keyword =>
    query.toLowerCase().includes(keyword)
  );

  if (hasShoppingKeyword) return true;

  // Search web for current events/news
  const newsKeywords = ['news', 'latest', 'today', 'current', 'recent', 'update'];
  const hasNewsKeyword = newsKeywords.some(keyword =>
    query.toLowerCase().includes(keyword)
  );

  if (hasNewsKeyword) return true;

  // Search web for specific questions
  if (query.includes('?') || query.toLowerCase().startsWith('what') ||
      query.toLowerCase().startsWith('how') || query.toLowerCase().startsWith('why') ||
      query.toLowerCase().startsWith('where') || query.toLowerCase().startsWith('when')) {
    return fileResultsCount < 3; // Search web if few file results
  }

  return false;
}

module.exports = {
  searchWeb,
  searchProducts,
  enhancedWebSearch,
  shouldPerformWebSearch,
  getFaviconUrl
};
