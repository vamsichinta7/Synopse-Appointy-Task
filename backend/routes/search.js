const express = require('express');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth');
const { parseSearchQuery } = require('../services/claudeService');
const { generateEmbedding, cosineSimilarity } = require('../services/embeddingService');
const { enhancedWebSearch, shouldPerformWebSearch } = require('../services/webSearchService');

const router = express.Router();

router.use(authMiddleware);

// @route   POST /api/search
// @desc    Intelligent search using natural language with AI insights
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Parse query using Claude
    const parsedQuery = await parseSearchQuery(query);

    // Build MongoDB query with enhanced text search
    const mongoQuery = buildMongoQuery(parsedQuery, req.userId, query);

    console.log(`Search query: "${query}"`);
    console.log(`Parsed category filter: ${parsedQuery.filters?.category || 'none'}`);

    // Add full-text search across all relevant fields
    const searchTerms = query.split(' ').filter(term => term.length > 2);
    if (searchTerms.length > 0) {
      // Enhanced search that checks all fields including metadata
      // Items must match ALL search terms (not just ANY term)
      const searchConditions = searchTerms.map(term => ({
        $or: [
          { title: { $regex: term, $options: 'i' } },
          { summary: { $regex: term, $options: 'i' } },
          { content: { $regex: term, $options: 'i' } },
          { caption: { $regex: term, $options: 'i' } },
          { tags: { $regex: term, $options: 'i' } },
          { keyPoints: { $elemMatch: { $regex: term, $options: 'i' } } },
          { 'metadata.fileName': { $regex: term, $options: 'i' } }
        ]
      }));

      // Merge with existing $and conditions if any (e.g., from price filters)
      if (mongoQuery.$and) {
        mongoQuery.$and = [...mongoQuery.$and, ...searchConditions];
      } else {
        mongoQuery.$and = searchConditions;
      }
    }

    console.log(`MongoDB query:`, JSON.stringify(mongoQuery, null, 2));

    // Get items from database
    let items = await Item.find(mongoQuery)
      .select('+embedding')
      .limit(100)
      .sort({ createdAt: -1 });

    console.log(`Found ${items.length} items matching search`);

    // If semantic search is needed, rank by similarity
    if (parsedQuery.semantic_keywords && parsedQuery.semantic_keywords.length > 0) {
      const queryEmbedding = await generateEmbedding(query);

      if (queryEmbedding) {
        items = items.map(item => {
          const similarity = item.embedding
            ? cosineSimilarity(queryEmbedding, item.embedding)
            : 0;

          return {
            ...item.toObject(),
            similarity,
            embedding: undefined // Remove embedding from response
          };
        });

        // Sort by similarity
        items.sort((a, b) => b.similarity - a.similarity);

        // Take top 50
        items = items.slice(0, 50);
      }
    } else {
      // Remove embeddings and convert to plain objects
      items = items.map(item => {
        const obj = item.toObject();
        delete obj.embedding;
        return obj;
      });
    }

    // Generate AI insights about the search results
    const aiInsights = await generateSearchInsights(query, items, parsedQuery);

    // Determine if we should perform web search
    const performWebSearch = shouldPerformWebSearch(query, items.length);

    let webResults = null;
    if (performWebSearch) {
      console.log(`Performing web search for: "${query}"`);

      // Determine search type based on query
      let searchType = 'general';
      if (query.match(/\d+\s*(rupees|rs|inr|dollars|\$)/i) ||
          query.toLowerCase().includes('buy') ||
          query.toLowerCase().includes('shop') ||
          query.toLowerCase().includes('price')) {
        searchType = 'products';
      }

      webResults = await enhancedWebSearch(query, searchType);
    }

    res.json({
      mode: 'search',
      query: query,
      parsed: parsedQuery,
      results: items,
      count: items.length,
      aiInsights: aiInsights,
      webResults: webResults
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Error performing search' });
  }
});

// @route   GET /api/search/suggestions
// @desc    Get search suggestions based on user's data
// @access  Private
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Find matching tags
    const tags = await Item.distinct('tags', {
      userId: req.userId,
      tags: new RegExp(q, 'i')
    });

    // Find matching titles
    const items = await Item.find({
      userId: req.userId,
      title: new RegExp(q, 'i')
    })
      .select('title category')
      .limit(5);

    const suggestions = [
      ...tags.map(tag => ({ type: 'tag', value: tag })),
      ...items.map(item => ({ type: 'item', value: item.title, category: item.category }))
    ];

    res.json({ suggestions: suggestions.slice(0, 10) });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Error fetching suggestions' });
  }
});

/**
 * Build MongoDB query from parsed search parameters
 */
function buildMongoQuery(parsedQuery, userId, originalQuery = '') {
  const query = {
    userId,
    isArchived: false
  };

  const filters = parsedQuery.filters || {};

  // Category filter - only apply if user explicitly searches for category-specific terms
  // Don't filter by category for general keyword searches
  const categoryKeywords = ['articles', 'videos', 'images', 'notes', 'products', 'todos', 'books', 'papers', 'quotes', 'ideas'];
  const queryLower = originalQuery.toLowerCase();
  const hasCategoryKeyword = categoryKeywords.some(kw => queryLower.includes(kw));

  if (filters.category && filters.category !== 'all' && filters.category !== 'unknown' && hasCategoryKeyword) {
    query.category = filters.category;
    console.log(`Applying category filter: ${filters.category}`);
  } else if (filters.category && filters.category !== 'all' && filters.category !== 'unknown') {
    console.log(`Skipping category filter "${filters.category}" - no explicit category keyword in query: "${originalQuery}"`);
  }

  // Time range filter
  if (filters.time_range) {
    const timeFilter = {};

    if (filters.time_range.from) {
      timeFilter.$gte = new Date(filters.time_range.from);
    }

    if (filters.time_range.to) {
      timeFilter.$lte = new Date(filters.time_range.to);
    }

    if (Object.keys(timeFilter).length > 0) {
      query.createdAt = timeFilter;
    }
  }

  // Price range filter
  if (filters.price_range && (filters.price_range.min || filters.price_range.max)) {
    const priceConditions = [];

    if (filters.price_range.min) {
      priceConditions.push({
        'metadata.price': { $gte: String(filters.price_range.min) }
      });
    }

    if (filters.price_range.max) {
      priceConditions.push({
        'metadata.price': { $lte: String(filters.price_range.max) }
      });
    }

    if (priceConditions.length > 0) {
      query.$and = priceConditions;
    }
  }

  // Topics/tags filter
  if (filters.topics && filters.topics.length > 0) {
    query.$or = [
      { tags: { $in: filters.topics.map(t => t.toLowerCase()) } },
      { title: { $in: filters.topics.map(t => new RegExp(t, 'i')) } },
      { summary: { $in: filters.topics.map(t => new RegExp(t, 'i')) } }
    ];
  }

  return query;
}

/**
 * Generate AI insights about search results using Claude
 */
async function generateSearchInsights(query, items, parsedQuery) {
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Prepare context about found items
    const itemsSummary = items.slice(0, 10).map(item => ({
      title: item.title,
      category: item.category,
      summary: item.summary?.substring(0, 200),
      tags: item.tags?.slice(0, 5)
    }));

    const promptMessage = `User searched for: "${query}"

Found ${items.length} results in their knowledge base.

Top results:
${JSON.stringify(itemsSummary, null, 2)}

Parsed query understanding:
${JSON.stringify(parsedQuery, null, 2)}

Please provide:
1. A brief explanation of what the user is looking for
2. Key themes or topics in the results found
3. Suggestions for related searches or topics they might be interested in
4. If no results found, suggest why and what they could try instead

Format your response as JSON:
{
  "interpretation": "What the user is searching for",
  "themes": ["theme1", "theme2"],
  "keyFindings": "Brief summary of what was found",
  "suggestions": ["suggestion1", "suggestion2"],
  "relatedSearches": ["related search 1", "related search 2"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: promptMessage
      }]
    });

    let responseText = response.content[0].text.trim();
    responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    const insights = JSON.parse(responseText);
    return insights;
  } catch (error) {
    console.error('AI Insights error:', error);
    return {
      interpretation: 'Unable to generate AI insights',
      themes: [],
      keyFindings: `Found ${items.length} matching items`,
      suggestions: [],
      relatedSearches: []
    };
  }
}

module.exports = router;
