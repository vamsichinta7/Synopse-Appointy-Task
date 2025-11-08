const Anthropic = require('@anthropic-ai/sdk');

// Verify API key is configured
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('⚠️  WARNING: ANTHROPIC_API_KEY is not set in environment variables!');
  console.error('   AI features (image analysis, content processing) will not work.');
  console.error('   Please add ANTHROPIC_API_KEY to your .env file.');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// The system prompt that defines how Claude should process content
const SYNAPSE_SYSTEM_PROMPT = `You are Synapse — an intelligent, personal, AI-powered Second Brain integrated into a web application.

You are connected to a backend that manages users, authentication, file storage, and a database.
Each user has their own private "Synapse Brain," where they can save anything — text, URLs, PDFs, images, handwritten notes, research papers, videos, and more.

Your role is to understand, structure, and retrieve that saved information intelligently.

You **never** chat conversationally.
You always respond in **pure, valid JSON**, with double quotes, no markdown or extra text.

---

### INGEST MODE (Analyze and Structure Content)
When given content to analyze, return this JSON schema:

{
  "mode": "ingest",
  "category": "article | product | todo | quote | paper | book | note | idea | video | image | research | code | design | others | unknown",
  "title": "string",
  "summary": "2–3 sentence summary of what this content is or means",
  "key_points": ["point1", "point2", "point3"],
  "metadata": {
    "url": "string or null",
    "author": "string or null",
    "source_name": "string or null",
    "date_detected": "ISO date or null",
    "price": "string or null",
    "currency": "string or null",
    "image_url": "string or null",
    "video_embed": "string or null",
    "source_type": "web | pdf | image | note | handwritten | capture"
  },
  "tags": ["topic1", "topic2", "topic3"],
  "visual_style": "card | list | quote | gallery | video | idea-card | paper-card | product-card | todo-list | book-card | code-block | design-card",
  "actionable_items": ["optional next steps"],
  "related_context": ["related themes or saved items"],
  "confidence": "high | medium | low"
}

**Rules:**
- Identify what kind of thing was saved and label it correctly
- Fill in metadata automatically (price, author, source, etc.)
- Always generate 3–8 relevant tags
- Extract key points and actionable items
- Choose the most appropriate visual style for display

---

### SEARCH MODE (Parse Natural Language Queries)
When given a search query, return this JSON schema:

{
  "mode": "search",
  "query_intent": "retrieve_saved_items",
  "filters": {
    "category": "article | quote | todo | product | all",
    "topics": ["keyword1", "keyword2"],
    "time_range": {
      "from": "YYYY-MM-DD",
      "to": "YYYY-MM-DD"
    },
    "price_range": {
      "min": number or null,
      "max": number or null
    }
  },
  "semantic_keywords": ["keyword1", "keyword2"],
  "sort": "recent | relevance | priority"
}

**Rules:**
- Detect category and time from query
- Convert phrases like "yesterday," "last week," "this month" to ISO date ranges
- Extract topics for semantic search
- Identify price constraints if mentioned

---

Output must always be valid JSON. Use null for missing fields. No markdown, no prose.`;

/**
 * Process content using Claude AI
 * @param {string} content - The content to analyze
 * @param {string} contentType - Type of content (text, url, image_text, etc.)
 * @param {object} additionalContext - Any additional context
 * @returns {Promise<object>} Structured response from Claude
 */
async function processContent(content, contentType = 'text', additionalContext = {}) {
  try {
    const userMessage = buildContentMessage(content, contentType, additionalContext);

    // Check if we have image data for Vision API
    const hasImageData = additionalContext.imageData && additionalContext.imageMimeType;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      system: SYNAPSE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: hasImageData ? [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: additionalContext.imageMimeType,
                data: additionalContext.imageData,
              },
            },
            {
              type: 'text',
              text: userMessage
            }
          ] : userMessage
        }
      ]
    });

    let responseText = response.content[0].text.trim();

    // Strip markdown code blocks if present
    responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    responseText = responseText.trim();

    // Parse JSON response
    const parsed = JSON.parse(responseText);

    return parsed;
  } catch (error) {
    console.error('Claude API Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      contentType,
      hasImageData: additionalContext.imageData ? 'yes' : 'no',
      imageMimeType: additionalContext.imageMimeType || 'none'
    });

    // Return fallback structure based on content type
    const fallbackCategory = contentType === 'image' ? 'image' :
                            contentType === 'pdf' ? 'paper' :
                            contentType === 'video' ? 'video' : 'note';

    const fallbackTitle = additionalContext.fileName ||
                         content.substring(0, 100) ||
                         'Untitled Item';

    return {
      mode: 'ingest',
      category: fallbackCategory,
      title: fallbackTitle,
      summary: contentType === 'image'
        ? 'Image uploaded successfully. AI analysis is temporarily unavailable, but the image has been saved and can be viewed above.'
        : 'Content saved for later review. AI analysis is temporarily unavailable.',
      key_points: [],
      metadata: {
        source_type: contentType,
        ...additionalContext
      },
      tags: contentType === 'image' ? ['image', 'visual'] : [],
      visual_style: contentType === 'image' ? 'gallery' : 'card',
      actionable_items: [],
      related_context: [],
      confidence: 'low',
      error: error.message
    };
  }
}

/**
 * Parse search query using Claude AI
 * @param {string} query - Natural language search query
 * @returns {Promise<object>} Parsed search parameters
 */
async function parseSearchQuery(query) {
  try {
    const userMessage = `Parse this search query and extract filters:\n\n"${query}"\n\nToday's date is ${new Date().toISOString().split('T')[0]}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      system: SYNAPSE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    let responseText = response.content[0].text.trim();

    // Strip markdown code blocks if present
    responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    responseText = responseText.trim();

    const parsed = JSON.parse(responseText);

    return parsed;
  } catch (error) {
    console.error('Search query parsing error:', error);

    // Fallback to basic keyword search
    return {
      mode: 'search',
      query_intent: 'retrieve_saved_items',
      filters: {
        category: 'all',
        topics: query.split(' ').filter(word => word.length > 2),
        time_range: {},
        price_range: {}
      },
      semantic_keywords: query.split(' '),
      sort: 'recent'
    };
  }
}

function buildContentMessage(content, contentType, additionalContext) {
  let message = `Analyze and structure this content for storage in a Second Brain:\n\n`;

  message += `Content Type: ${contentType}\n`;

  if (additionalContext.url) {
    message += `URL: ${additionalContext.url}\n`;
  }

  if (additionalContext.sourceHtml) {
    message += `\nHTML Content:\n${additionalContext.sourceHtml}\n`;
  }

  // Special instructions for images
  if (contentType === 'image' && additionalContext.imageData) {
    message += `\nI've uploaded an image. Please analyze the image and provide:
- A detailed summary of what you see in the image (objects, people, scene, text, diagrams, etc.)
- The main subject or purpose of the image
- Any text visible in the image (OCR text provided: "${content}")
- Key visual elements or important details
- Relevant tags based on the image content
- Suggested title based on what's shown

Provide comprehensive analysis of the visual content in the image.\n`;
  } else {
    message += `\nContent:\n${content}\n`;
  }

  // Add specific instructions for web content
  if (contentType === 'web' || contentType === 'video') {
    message += `\nFor this ${contentType} content, provide:
- A comprehensive summary that captures the main topic and key insights
- Extract all available metadata (author, source name, publish date, etc.)
- Identify 3-8 highly relevant tags
- List 3-5 key takeaways or main points
- Suggest actionable items if applicable\n`;
  }

  message += `\nProvide structured JSON analysis using INGEST MODE.`;

  return message;
}

module.exports = {
  processContent,
  parseSearchQuery
};
