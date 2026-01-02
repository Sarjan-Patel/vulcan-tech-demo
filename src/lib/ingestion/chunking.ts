// Token-based text chunking utilities

export interface ChunkConfig {
  targetTokens: number; // Target chunk size (default: 300)
  minTokens: number; // Minimum chunk size (default: 100)
  maxTokens: number; // Maximum chunk size (default: 600)
  overlapTokens: number; // Overlap between chunks (default: 50)
}

export interface TextChunk {
  text: string;
  tokenCount: number;
  startOffset: number;
  endOffset: number;
  chunkIndex: number;
}

const DEFAULT_CONFIG: ChunkConfig = {
  targetTokens: 300,
  minTokens: 100,
  maxTokens: 600,
  overlapTokens: 50,
};

/**
 * Estimate token count from text.
 * Approximation: ~1.3 tokens per word for English text.
 */
export function estimateTokenCount(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  const words = text.trim().split(/\s+/).length;
  // Add extra for punctuation and special characters
  const punctuation = (text.match(/[.,!?;:()[\]{}'"]/g) || []).length;
  return Math.ceil(words * 1.3 + punctuation * 0.3);
}

/**
 * Chunk text into segments of approximately targetTokens size.
 * Uses a recursive splitting approach with overlap.
 */
export function chunkText(
  text: string,
  config: Partial<ChunkConfig> = {}
): TextChunk[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const chunks: TextChunk[] = [];

  if (!text || text.trim().length === 0) {
    return chunks;
  }

  // Clean up the text
  const cleanText = text.trim().replace(/\s+/g, ' ');
  const totalTokens = estimateTokenCount(cleanText);

  // If text is small enough, return as single chunk
  if (totalTokens <= cfg.maxTokens) {
    return [
      {
        text: cleanText,
        tokenCount: totalTokens,
        startOffset: 0,
        endOffset: cleanText.length,
        chunkIndex: 0,
      },
    ];
  }

  // Split text into sentences or paragraphs
  const segments = splitTextIntoSegments(cleanText);
  let currentChunk = '';
  let currentOffset = 0;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const segmentTokens = estimateTokenCount(segment);
    const currentTokens = estimateTokenCount(currentChunk);
    const combinedTokens = estimateTokenCount(currentChunk + ' ' + segment);

    // If segment alone is too big, split it further
    if (segmentTokens > cfg.maxTokens) {
      // Save current chunk if not empty
      if (currentChunk.length > 0 && currentTokens >= cfg.minTokens) {
        chunks.push({
          text: currentChunk.trim(),
          tokenCount: currentTokens,
          startOffset: currentOffset,
          endOffset: currentOffset + currentChunk.length,
          chunkIndex: chunks.length,
        });
        currentOffset += currentChunk.length;
        currentChunk = '';
      }

      // Force split the large segment
      const subChunks = forceSplitText(segment, cfg);
      for (const subChunk of subChunks) {
        chunks.push({
          ...subChunk,
          startOffset: currentOffset + subChunk.startOffset,
          endOffset: currentOffset + subChunk.endOffset,
          chunkIndex: chunks.length,
        });
      }
      currentOffset += segment.length;
      continue;
    }

    // If adding segment would exceed max, save current chunk
    if (combinedTokens > cfg.maxTokens && currentChunk.length > 0) {
      if (currentTokens >= cfg.minTokens) {
        chunks.push({
          text: currentChunk.trim(),
          tokenCount: currentTokens,
          startOffset: currentOffset,
          endOffset: currentOffset + currentChunk.length,
          chunkIndex: chunks.length,
        });

        // Create overlap from end of current chunk
        const overlapText = getOverlapText(currentChunk, cfg.overlapTokens);
        currentOffset += currentChunk.length - overlapText.length;
        currentChunk = overlapText;
      }
    }

    // Add segment to current chunk
    currentChunk = currentChunk.length > 0 ? currentChunk + ' ' + segment : segment;
  }

  // Handle remaining chunk
  if (currentChunk.length > 0) {
    const tokenCount = estimateTokenCount(currentChunk);
    if (tokenCount >= cfg.minTokens || chunks.length === 0) {
      chunks.push({
        text: currentChunk.trim(),
        tokenCount,
        startOffset: currentOffset,
        endOffset: currentOffset + currentChunk.length,
        chunkIndex: chunks.length,
      });
    } else if (chunks.length > 0) {
      // Merge with previous chunk if too small
      const lastChunk = chunks[chunks.length - 1];
      lastChunk.text = lastChunk.text + ' ' + currentChunk.trim();
      lastChunk.tokenCount = estimateTokenCount(lastChunk.text);
      lastChunk.endOffset = currentOffset + currentChunk.length;
    }
  }

  // Re-index chunks
  return chunks.map((chunk, index) => ({
    ...chunk,
    chunkIndex: index,
  }));
}

/**
 * Split text into sentence-like segments.
 */
function splitTextIntoSegments(text: string): string[] {
  // Split by sentence-ending punctuation followed by space
  const segments = text.split(/(?<=[.!?])\s+/);
  return segments.filter((s) => s.trim().length > 0);
}

/**
 * Force split a large text into chunks by character count.
 */
function forceSplitText(text: string, cfg: ChunkConfig): TextChunk[] {
  const chunks: TextChunk[] = [];
  const targetChars = Math.floor(cfg.targetTokens * 4); // ~4 chars per token
  let offset = 0;

  while (offset < text.length) {
    let endPos = Math.min(offset + targetChars, text.length);

    // Try to break at a word boundary
    if (endPos < text.length) {
      const spacePos = text.lastIndexOf(' ', endPos);
      if (spacePos > offset) {
        endPos = spacePos;
      }
    }

    const chunkText = text.slice(offset, endPos).trim();
    if (chunkText.length > 0) {
      chunks.push({
        text: chunkText,
        tokenCount: estimateTokenCount(chunkText),
        startOffset: offset,
        endOffset: endPos,
        chunkIndex: chunks.length,
      });
    }

    offset = endPos;
    // Skip whitespace
    while (offset < text.length && text[offset] === ' ') {
      offset++;
    }
  }

  return chunks;
}

/**
 * Get overlap text from the end of a chunk.
 */
function getOverlapText(text: string, overlapTokens: number): string {
  const words = text.split(/\s+/);
  const overlapWords = Math.ceil(overlapTokens / 1.3);
  const startIndex = Math.max(0, words.length - overlapWords);
  return words.slice(startIndex).join(' ');
}
