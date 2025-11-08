/**
 * Generate embeddings for semantic search
 * NOTE: Embeddings disabled - using Claude API only for content processing
 * Semantic search is handled through MongoDB text indexes instead
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<number[]>} Embedding vector (always null)
 */
async function generateEmbedding(text) {
  // Embeddings disabled - using MongoDB text search instead
  // This keeps the code compatible while removing the Gemini dependency
  return null;
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} Similarity score (0-1)
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Build text for embedding from item
 * @param {object} item
 * @returns {string}
 */
function buildEmbeddingText(item) {
  const parts = [
    item.title,
    item.summary,
    item.keyPoints?.join(' '),
    item.tags?.join(' '),
    item.content?.substring(0, 500)
  ].filter(Boolean);

  return parts.join(' ');
}

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  buildEmbeddingText
};
