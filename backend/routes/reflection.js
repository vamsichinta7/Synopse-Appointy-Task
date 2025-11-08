const express = require('express');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/auth');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

router.use(authMiddleware);

// @route   POST /api/reflection
// @desc    Generate reflection/summary of saved items
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { timeframe = 'week' } = req.body;

    // Calculate date range
    const dateRange = getDateRange(timeframe);

    // Get items from the timeframe
    const items = await Item.find({
      userId: req.userId,
      createdAt: { $gte: dateRange.from, $lte: dateRange.to },
      isArchived: false
    })
      .select('title category summary tags createdAt')
      .sort('-createdAt')
      .limit(100);

    if (items.length === 0) {
      return res.json({
        mode: 'reflection',
        category: 'summary',
        title: `${capitalizeFirst(timeframe)} Brain Digest`,
        summary: `You haven't saved anything in the past ${timeframe} yet. Start capturing your thoughts and ideas!`,
        themes: [],
        insights: [],
        suggested_actions: ['Start saving articles, notes, or ideas that interest you']
      });
    }

    // Generate reflection using Claude
    const reflection = await generateReflection(items, timeframe);

    res.json({
      mode: 'reflection',
      user_context: {
        user_id: req.userId,
        username: req.user.username
      },
      ...reflection,
      itemCount: items.length,
      timeframe: {
        from: dateRange.from,
        to: dateRange.to
      }
    });
  } catch (error) {
    console.error('Reflection error:', error);
    res.status(500).json({ error: 'Error generating reflection' });
  }
});

// @route   GET /api/reflection/stats
// @desc    Get statistics about saved items
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    const dateRange = getDateRange(timeframe);

    const [
      totalItems,
      categoryStats,
      topTags,
      recentItems
    ] = await Promise.all([
      Item.countDocuments({
        userId: req.userId,
        createdAt: { $gte: dateRange.from, $lte: dateRange.to }
      }),
      Item.aggregate([
        {
          $match: {
            userId: req.userId,
            createdAt: { $gte: dateRange.from, $lte: dateRange.to }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]),
      Item.aggregate([
        {
          $match: {
            userId: req.userId,
            createdAt: { $gte: dateRange.from, $lte: dateRange.to }
          }
        },
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]),
      Item.find({
        userId: req.userId,
        createdAt: { $gte: dateRange.from, $lte: dateRange.to }
      })
        .select('title category createdAt')
        .sort('-createdAt')
        .limit(5)
    ]);

    res.json({
      timeframe,
      totalItems,
      categoryBreakdown: categoryStats,
      topTags: topTags.map(t => ({ tag: t._id, count: t.count })),
      recentItems
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

/**
 * Generate reflection using Claude
 */
async function generateReflection(items, timeframe) {
  const itemsSummary = items.map(item => ({
    title: item.title,
    category: item.category,
    tags: item.tags,
    summary: item.summary
  }));

  const prompt = `Analyze these ${items.length} items saved in the past ${timeframe} and provide insights:

${JSON.stringify(itemsSummary, null, 2)}

Generate a reflection in this JSON format:
{
  "category": "summary",
  "title": "Weekly Brain Digest" (or appropriate timeframe),
  "summary": "3-4 sentence summary of main topics and patterns",
  "themes": ["main topic 1", "main topic 2", "main topic 3"],
  "insights": ["insight 1", "insight 2", "insight 3"],
  "suggested_actions": ["actionable next step 1", "actionable next step 2"]
}

Focus on:
- What topics the user is most interested in
- Patterns in their saving behavior
- Connections between different items
- Actionable next steps based on what they saved`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = response.content[0].text.trim();
    const parsed = JSON.parse(responseText);

    return parsed;
  } catch (error) {
    console.error('Claude reflection error:', error);

    // Fallback reflection
    const categories = [...new Set(items.map(i => i.category))];
    const allTags = items.flatMap(i => i.tags);
    const topTags = [...new Set(allTags)].slice(0, 5);

    return {
      category: 'summary',
      title: `${capitalizeFirst(timeframe)} Brain Digest`,
      summary: `You saved ${items.length} items this ${timeframe}, focusing on ${categories.join(', ')}. Your interests span ${topTags.join(', ')}.`,
      themes: topTags,
      insights: [
        `You saved ${items.length} items this ${timeframe}`,
        `Most common categories: ${categories.slice(0, 3).join(', ')}`
      ],
      suggested_actions: [
        'Review your saved items',
        'Organize by tags',
        'Take action on saved to-dos'
      ]
    };
  }
}

/**
 * Get date range for timeframe
 */
function getDateRange(timeframe) {
  const now = new Date();
  const from = new Date();

  switch (timeframe) {
    case 'day':
      from.setDate(now.getDate() - 1);
      break;
    case 'week':
      from.setDate(now.getDate() - 7);
      break;
    case 'month':
      from.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      from.setFullYear(now.getFullYear() - 1);
      break;
    default:
      from.setDate(now.getDate() - 7);
  }

  return { from, to: now };
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = router;
