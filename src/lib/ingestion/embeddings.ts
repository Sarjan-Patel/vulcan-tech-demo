// Fake embedding generation utilities
// Uses hash-seeded PRNG for deterministic, reproducible embeddings

const EMBEDDING_DIMENSIONS = 384;

/**
 * Simple hash function for string to number.
 * Uses djb2 algorithm for consistent results.
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) ^ char; // hash * 33 ^ char
  }
  return Math.abs(hash);
}

/**
 * Seeded pseudo-random number generator.
 * Uses a simple Linear Congruential Generator (LCG).
 */
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    // LCG parameters (same as glibc)
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Generate a fake embedding vector from text.
 * The embedding is deterministic - same text always produces same embedding.
 *
 * @param text - The text to generate an embedding for
 * @param dimensions - Number of dimensions (default: 384)
 * @returns Normalized embedding vector
 */
export function generateFakeEmbedding(
  text: string,
  dimensions: number = EMBEDDING_DIMENSIONS
): number[] {
  // Create seed from text hash
  const seed = hashString(text);
  const rng = createSeededRandom(seed);

  // Generate random vector
  const vector: number[] = [];
  for (let i = 0; i < dimensions; i++) {
    // Generate values in range [-1, 1]
    vector.push(rng() * 2 - 1);
  }

  // Normalize to unit length
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map((v) => v / magnitude);
}

/**
 * Compute cosine similarity between two vectors.
 * Returns value in range [-1, 1] where 1 is most similar.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same dimensions');
  }

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Generate a checksum for text content.
 * Uses a simple hash converted to hex.
 */
export function generateChecksum(text: string): string {
  const hash = hashString(text);
  return hash.toString(16).padStart(8, '0');
}

/**
 * Project high-dimensional embeddings to 2D for visualization.
 * Uses a simple random projection (not true PCA/t-SNE but deterministic).
 */
export function projectTo2D(
  embeddings: number[][],
  seed: number = 42
): Array<{ x: number; y: number }> {
  if (embeddings.length === 0) return [];

  const dimensions = embeddings[0].length;
  const rng = createSeededRandom(seed);

  // Create random projection vectors
  const projX: number[] = [];
  const projY: number[] = [];
  for (let i = 0; i < dimensions; i++) {
    projX.push(rng() * 2 - 1);
    projY.push(rng() * 2 - 1);
  }

  return embeddings.map((emb) => {
    let x = 0;
    let y = 0;
    for (let i = 0; i < emb.length; i++) {
      x += emb[i] * projX[i];
      y += emb[i] * projY[i];
    }
    return { x, y };
  });
}
