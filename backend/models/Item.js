const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: [
      'article', 'product', 'todo', 'quote', 'paper',
      'book', 'note', 'idea', 'video', 'image',
      'research', 'code', 'design', 'others', 'unknown'
    ],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  caption: {
    type: String,
    trim: true,
    default: ''
  },
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  keyPoints: [{
    type: String
  }],
  metadata: {
    url: String,
    author: String,
    sourceName: String,
    dateDetected: Date,
    price: String,
    currency: String,
    imageUrl: String,
    videoEmbed: String,
    sourceType: {
      type: String,
      enum: ['web', 'pdf', 'image', 'note', 'handwritten', 'capture', 'manual']
    },
    fileName: String,
    fileSize: Number,
    filePath: String
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
    index: true
  }],
  visualStyle: {
    type: String,
    enum: [
      'card', 'list', 'quote', 'gallery', 'video',
      'idea-card', 'paper-card', 'product-card',
      'todo-list', 'book-card', 'code-block', 'design-card'
    ],
    default: 'card'
  },
  actionableItems: [{
    type: String
  }],
  relatedContext: [{
    type: String
  }],
  embedding: {
    type: [Number],
    select: false  // Don't include in regular queries
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  accessedAt: {
    type: Date,
    default: Date.now
  }
});

// Update accessedAt when item is viewed
itemSchema.methods.markAccessed = function() {
  this.accessedAt = new Date();
  return this.save();
};

// Text index for full-text search
itemSchema.index({
  title: 'text',
  caption: 'text',
  summary: 'text',
  content: 'text',
  tags: 'text',
  keyPoints: 'text'
});

// Compound indexes for common queries
itemSchema.index({ userId: 1, category: 1, createdAt: -1 });
itemSchema.index({ userId: 1, tags: 1 });
itemSchema.index({ userId: 1, isArchived: 1, createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);
