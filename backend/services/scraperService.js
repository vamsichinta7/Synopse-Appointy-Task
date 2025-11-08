const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape webpage content
 * @param {string} url - URL to scrape
 * @returns {Promise<object>} Scraped data
 */
async function scrapeUrl(url) {
  try {
    // Special handling for YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return await scrapeYouTubeVideo(url);
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, iframe, ads').remove();

    // Extract metadata
    const metadata = {
      url,
      title: extractTitle($),
      description: extractDescription($),
      author: extractAuthor($),
      publishedDate: extractDate($),
      imageUrl: extractImage($, url),
      siteName: extractSiteName($),
      type: detectContentType($, url)
    };

    // Extract main content
    const content = extractMainContent($);

    return {
      metadata,
      content,
      html: $.html()
    };
  } catch (error) {
    console.error('Scraping error:', error.message);
    return {
      metadata: {
        url,
        title: url,
        error: error.message
      },
      content: '',
      html: ''
    };
  }
}

/**
 * Scrape YouTube video using oEmbed API
 * @param {string} url - YouTube URL
 * @returns {Promise<object>} Video data
 */
async function scrapeYouTubeVideo(url) {
  try {
    const youtubeData = extractYouTubeData(url);

    if (!youtubeData) {
      throw new Error('Invalid YouTube URL');
    }

    // Use YouTube oEmbed API to get video info
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await axios.get(oembedUrl, { timeout: 5000 });
    const data = response.data;

    return {
      metadata: {
        url,
        title: data.title || 'YouTube Video',
        author: data.author_name || 'Unknown',
        sourceName: 'YouTube',
        imageUrl: youtubeData.thumbnailUrl,
        videoEmbed: youtubeData.embedUrl,
        type: 'video'
      },
      content: `${data.title} by ${data.author_name}`,
      html: ''
    };
  } catch (error) {
    console.error('YouTube scraping error:', error.message);

    // Fallback using just the video ID
    const youtubeData = extractYouTubeData(url);
    if (youtubeData) {
      return {
        metadata: {
          url,
          title: 'YouTube Video',
          sourceName: 'YouTube',
          imageUrl: youtubeData.thumbnailUrl,
          videoEmbed: youtubeData.embedUrl,
          type: 'video'
        },
        content: 'YouTube video',
        html: ''
      };
    }

    throw error;
  }
}

function extractTitle($) {
  return (
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text() ||
    $('h1').first().text() ||
    ''
  ).trim();
}

function extractDescription($) {
  return (
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    ''
  ).trim();
}

function extractAuthor($) {
  return (
    $('meta[name="author"]').attr('content') ||
    $('meta[property="article:author"]').attr('content') ||
    $('[rel="author"]').text() ||
    $('.author').text() ||
    ''
  ).trim();
}

function extractDate($) {
  const dateStr = (
    $('meta[property="article:published_time"]').attr('content') ||
    $('meta[name="publish-date"]').attr('content') ||
    $('time').attr('datetime') ||
    ''
  ).trim();

  if (dateStr) {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

function extractImage($, baseUrl) {
  let imageUrl = (
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    $('img').first().attr('src') ||
    ''
  ).trim();

  // Convert relative URLs to absolute
  if (imageUrl && !imageUrl.startsWith('http')) {
    try {
      const base = new URL(baseUrl);
      imageUrl = new URL(imageUrl, base.origin).href;
    } catch (e) {
      // Invalid URL, ignore
    }
  }

  return imageUrl;
}

function extractSiteName($) {
  return (
    $('meta[property="og:site_name"]').attr('content') ||
    ''
  ).trim();
}

function detectContentType($, url) {
  // Check if it's a YouTube video
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'video';
  }

  // Check if it's an image
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
    return 'image';
  }

  // Check if it's a product page
  if ($('meta[property="product:price"]').length > 0 ||
      $('.price').length > 0 ||
      $('[itemprop="price"]').length > 0) {
    return 'product';
  }

  // Check if it's an article
  if ($('article').length > 0 || $('meta[property="article:published_time"]').length > 0) {
    return 'article';
  }

  return 'web';
}

function extractMainContent($) {
  // Try to find main content area
  const contentSelectors = [
    'article',
    'main',
    '[role="main"]',
    '.content',
    '.main-content',
    '#content',
    '.post-content',
    '.entry-content'
  ];

  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      return element.text().trim().substring(0, 5000);
    }
  }

  // Fallback to body text
  return $('body').text().trim().substring(0, 5000);
}

/**
 * Extract YouTube video ID and metadata
 * @param {string} url
 * @returns {object}
 */
function extractYouTubeData(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);

  if (match && match[1]) {
    return {
      videoId: match[1],
      embedUrl: `https://www.youtube.com/embed/${match[1]}`,
      thumbnailUrl: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
    };
  }

  return null;
}

module.exports = {
  scrapeUrl,
  extractYouTubeData
};
