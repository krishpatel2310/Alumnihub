// Utility functions for computing vector similarity for AI recommendations.

/**
 * Compute the dot product of two vectors.
 */
const dotProduct = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
};

/**
 * Compute the magnitude (Euclidean norm) of a vector.
 */
const magnitude = (v) => {
  if (!v) return 0;
  let sum = 0;
  for (let i = 0; i < v.length; i++) {
    sum += v[i] * v[i];
  }
  return Math.sqrt(sum);
};

/**
 * Compute cosine similarity between two vectors.
 * Returns a value in [-1, 1]. For embeddings, values are typically in [0, 1].
 */
export const cosineSimilarity = (a, b) => {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
};

/**
 * Rank a list of candidates by similarity against a target vector.
 * @param {number[]} targetVec - embedding for the current user/profile
 * @param {Array<{ id: string, vector: number[] }>} candidates - candidates with their vectors
 * @returns sorted array with added `score` field (descending)
 */
export const rankBySimilarity = (targetVec, candidates) => {
  if (!targetVec || !Array.isArray(candidates)) return [];

  const scored = candidates.map((candidate) => ({
    ...candidate,
    score: cosineSimilarity(targetVec, candidate.vector),
  }));

  return scored
    .filter((c) => typeof c.score === "number" && !Number.isNaN(c.score))
    .sort((a, b) => b.score - a.score);
};

