const express = require('express');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth');
const { processContent } = require('../services/claudeService');
const { generateEmbedding, buildEmbeddingText } = require('../services/embeddingService');
const { scrapeUrl, extractYouTubeData } = require('../services/scraperService');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   POST /api/items
// @desc    Create a new item
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { content, url, type = 'text', metadata = {}, caption = '', tags = [], category } = req.body;

    if (!content && !url) {
      return res.status(400).json({ error: 'Content or URL is required' });
    }

    let processedData;
    let scrapedData = {};

    // If URL is provided, scrape it
    if (url) {
      scrapedData = await scrapeUrl(url);

      // Check if it's a YouTube video
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

      // Process with Claude
      processedData = await processContent(
        content || scrapedData.content,
        isYouTube ? 'video' : 'web',
        {
          url,
          sourceHtml: scrapedData.html.substring(0, 2000),
          ...scrapedData.metadata
        }
      );
    } else {
      // Process text/manual content
      processedData = await processContent(content, type, metadata);
    }

    // Merge metadata
    const finalMetadata = {
      ...processedData.metadata,
      ...scrapedData.metadata,
      ...metadata,
      url: url || processedData.metadata?.url
    };

    // Determine final category: User-selected > YouTube detection > AI detection > default
    let finalCategory;
    if (category) {
      // User explicitly selected a category
      finalCategory = category;
    } else {
      // Auto-detect category
      const isYouTube = url && (url.includes('youtube.com') || url.includes('youtu.be'));
      finalCategory = isYouTube ? 'video' : (processedData.category || 'note');
    }

    // Merge tags from user input and AI processing
    const finalTags = [...new Set([...(tags || []), ...(processedData.tags || [])])];

    // Create item
    const item = new Item({
      userId: req.userId,
      category: finalCategory,
      title: scrapedData.metadata?.title || processedData.title || 'Untitled',
      caption: caption || '',
      summary: processedData.summary || '',
      content: content || scrapedData.content || '',
      keyPoints: processedData.key_points || [],
      metadata: finalMetadata,
      tags: finalTags,
      visualStyle: processedData.visual_style || 'card',
      actionableItems: processedData.actionable_items || [],
      relatedContext: processedData.related_context || []
    });

    // Generate embedding for semantic search
    const embeddingText = buildEmbeddingText(item);
    const embedding = await generateEmbedding(embeddingText);
    if (embedding) {
      item.embedding = embedding;
    }

    await item.save();

    res.status(201).json({
      mode: 'ingest',
      status: 'success',
      item: item.toObject(),
      processed: processedData
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Error creating item' });
  }
});

// @route   GET /api/items
// @desc    Get all items for user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      category,
      tags,
      search,
      limit = 50,
      page = 1,
      sort = '-createdAt',
      archived = 'false',
      favorite = 'false'
    } = req.query;

    const query = {
      userId: req.userId,
      isArchived: archived === 'true'
    };

    // Filter by favorites
    if (favorite === 'true') {
      query.isFavorite = true;
      query.isArchived = false; // Don't show archived items in favorites
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Item.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip(skip)
        .select('-embedding'),
      Item.countDocuments(query)
    ]);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Error fetching items' });
  }
});

// @route   GET /api/items/:id
// @desc    Get single item
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.userId
    }).select('-embedding');

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Mark as accessed
    item.markAccessed();

    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Error fetching item' });
  }
});

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const allowedUpdates = [
      'title', 'caption', 'summary', 'content', 'tags', 'category',
      'isPinned', 'isFavorite', 'isArchived', 'metadata'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    item.updatedAt = new Date();

    // Regenerate embedding if content changed
    if (req.body.content || req.body.title || req.body.summary) {
      const embeddingText = buildEmbeddingText(item);
      const embedding = await generateEmbedding(embeddingText);
      if (embedding) {
        item.embedding = embedding;
      }
    }

    await item.save();

    res.json({ item: item.toObject() });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Error updating item' });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Error deleting item' });
  }
});

// @route   GET /api/items/tags/all
// @desc    Get all unique tags for user (excluding archived items)
// @access  Private
router.get('/tags/all', async (req, res) => {
  try {
    // Only get tags from non-archived items
    const tags = await Item.distinct('tags', { userId: req.userId, isArchived: false });
    res.json({ tags: tags.sort() });
  } catch (error) {
    console.error('Get tags error:', error);
    res.json({ error: 'Error fetching tags' });
  }
});

module.exports = router;
