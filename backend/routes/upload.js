const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { createWorker } = require('tesseract.js');
const pdfParse = require('pdf-parse');
const authMiddleware = require('../middleware/auth');
const { processContent } = require('../services/claudeService');
const Item = require('../models/Item');
const { generateEmbedding, buildEmbeddingText } = require('../services/embeddingService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images, PDFs, and text files are allowed.'));
  }
});

router.use(authMiddleware);

// @route   POST /api/upload
// @desc    Upload and process file (image with OCR, PDF, etc.)
// @access  Private
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const caption = req.body.caption || '';

    // Parse tags and category from request body
    let userTags = [];
    if (req.body.tags) {
      try {
        userTags = JSON.parse(req.body.tags);
      } catch (e) {
        // If parsing fails, treat as comma-separated string
        userTags = req.body.tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
      }
    }
    const userCategory = req.body.category || null;

    let extractedText = '';
    let processedData;
    let sourceType = 'capture';

    // Process based on file type
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
      // Image - perform OCR and Vision analysis
      extractedText = await performOCR(filePath);
      sourceType = extractedText.length > 20 ? 'handwritten' : 'image';

      // Read image as base64 for Vision API
      const imageBuffer = await fs.readFile(filePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = req.file.mimetype;

      console.log(`Processing image: ${req.file.originalname}`);
      console.log(`Image size: ${(req.file.size / 1024).toFixed(2)} KB`);
      console.log(`MIME type: ${mimeType}`);
      console.log(`OCR extracted text length: ${extractedText.length} characters`);

      processedData = await processContent(
        extractedText || 'Image content',
        'image',
        {
          fileName: req.file.originalname,
          imageUrl: `/uploads/${req.file.filename}`,
          sourceType,
          imageData: base64Image,
          imageMimeType: mimeType
        }
      );

      console.log(`AI processing complete. Category: ${processedData.category}, Confidence: ${processedData.confidence}`);

      // Enhance searchability: If AI provided minimal data, extract keywords from OCR text
      if (processedData.confidence === 'low' && extractedText.length > 10) {
        console.log('AI confidence low, enhancing searchability with OCR keywords...');

        // Extract potential keywords from OCR text
        const ocrWords = extractedText
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 3)
          .filter(word => !['this', 'that', 'with', 'from', 'have', 'been', 'were', 'their', 'there'].includes(word))
          .slice(0, 10);

        // Add OCR keywords to tags if we don't have many tags
        if (processedData.tags.length < 3) {
          processedData.tags = [...new Set([...processedData.tags, ...ocrWords.slice(0, 5)])];
        }

        // If summary is the generic fallback, include OCR text snippet
        if (processedData.summary.includes('AI analysis is temporarily unavailable')) {
          const ocrSnippet = extractedText.substring(0, 200).trim();
          if (ocrSnippet) {
            processedData.summary = `Image with text content. Extracted text: "${ocrSnippet}${extractedText.length > 200 ? '...' : ''}"`;
          }
        }

        // If title is just the filename, try to make it more descriptive
        if (processedData.title === req.file.originalname && ocrWords.length > 0) {
          processedData.title = `Image: ${ocrWords.slice(0, 3).join(' ')}`;
        }
      }
    } else if (fileExt === '.pdf') {
      // PDF - extract text
      const pdfBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData.text;

      processedData = await processContent(
        extractedText,
        'pdf',
        {
          fileName: req.file.originalname,
          sourceType: 'pdf',
          pageCount: pdfData.numpages
        }
      );
    } else if (fileExt === '.txt') {
      // Text file
      extractedText = await fs.readFile(filePath, 'utf-8');

      processedData = await processContent(
        extractedText,
        'note',
        {
          fileName: req.file.originalname,
          sourceType: 'note'
        }
      );
    }

    // Determine final category: User-selected > AI detection > default
    const finalCategory = userCategory || processedData.category || 'note';

    // Merge tags from user input and AI processing
    const finalTags = [...new Set([...(userTags || []), ...(processedData.tags || [])])];

    console.log(`Final category: ${finalCategory}, Tags: ${finalTags.join(', ')}`);

    // Create item with enhanced searchability
    // Combine all searchable text: caption + AI summary + OCR text
    const searchableContent = [
      caption,
      extractedText,
      processedData.summary && !processedData.summary.includes('temporarily unavailable') ? processedData.summary : ''
    ].filter(Boolean).join('\n\n');

    const item = new Item({
      userId: req.userId,
      category: finalCategory,
      title: processedData.title || req.file.originalname,
      caption: caption || '',
      summary: processedData.summary || '',
      content: searchableContent || extractedText,
      keyPoints: processedData.key_points || [],
      metadata: {
        ...processedData.metadata,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        filePath: `/uploads/${req.file.filename}`,
        sourceType,
        caption: caption || undefined
      },
      tags: finalTags,
      visualStyle: processedData.visual_style || 'card',
      actionableItems: processedData.actionable_items || [],
      relatedContext: processedData.related_context || []
    });

    // Generate embedding
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
      processed: processedData,
      extractedText: extractedText.substring(0, 500)
    });
  } catch (error) {
    console.error('Upload error:', error);

    // Clean up file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({ error: error.message || 'Error processing file' });
  }
});

/**
 * Perform OCR on image
 */
async function performOCR(imagePath) {
  const worker = await createWorker('eng');

  try {
    const { data: { text } } = await worker.recognize(imagePath);
    return text.trim();
  } catch (error) {
    console.error('OCR error:', error);
    return '';
  } finally {
    await worker.terminate();
  }
}

module.exports = router;
