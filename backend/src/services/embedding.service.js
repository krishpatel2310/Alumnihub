// Service for generating text embeddings for AI recommendations.
// This is a thin wrapper around an external embedding API.
// Configure the API via environment variables:
// - EMBEDDING_API_URL
// - EMBEDDING_API_KEY

const EMBEDDING_API_URL = process.env.EMBEDDING_API_URL;
const EMBEDDING_API_KEY = process.env.EMBEDDING_API_KEY;

/**
 * Get an embedding vector for a given text.
 * Returns an array of numbers or null if embeddings are not configured.
 */
export const getEmbeddingForText = async (text) => {
  if (!text || !text.trim()) {
    return null;
  }

  if (!EMBEDDING_API_URL || !EMBEDDING_API_KEY) {
    console.warn(
      "[embedding.service] EMBEDDING_API_URL or EMBEDDING_API_KEY not set. Returning null embedding."
    );
    return null;
  }

  try {
    const response = await fetch(EMBEDDING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EMBEDDING_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
      }),
    });

    if (!response.ok) {
      console.error(
        "[embedding.service] Failed to fetch embedding:",
        response.status,
        response.statusText
      );
      return null;
    }

    const data = await response.json();

    // Support common response shapes:
    // - { data: [{ embedding: [...] }] }
    // - { embedding: [...] }
    const embedding =
      data?.data?.[0]?.embedding ?? data?.embedding ?? null;

    if (!embedding || !Array.isArray(embedding)) {
      console.error(
        "[embedding.service] Unexpected embedding response format:",
        data
      );
      return null;
    }

    return embedding;
  } catch (error) {
    console.error("[embedding.service] Error while fetching embedding:", error);
    return null;
  }
};

