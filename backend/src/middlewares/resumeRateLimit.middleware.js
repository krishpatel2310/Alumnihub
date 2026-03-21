import ApiError from "../utils/ApiError.js";

/**
 * Simple in-memory rate limiter for resume operations
 * In production, use Redis or similar
 */
const rateLimitStore = new Map();

/**
 * Rate limiting middleware for resume generation
 * Limits each user to a certain number of requests per time window
 */
export const resumeGenerationRateLimit = (req, res, next) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const key = `resume_generate:${userId}`;
    const now = Date.now();
    const WINDOW = 60 * 60 * 1000; // 1 hour
    const MAX_REQUESTS = 50;

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry) {
        // First request
        rateLimitStore.set(key, { count: 1, windowStart: now });
        return next();
    }

    // Check if window has expired
    if (now - entry.windowStart > WINDOW) {
        // Reset window
        rateLimitStore.set(key, { count: 1, windowStart: now });
        return next();
    }

    // Within window - check count
    if (entry.count >= MAX_REQUESTS) {
        const resetTime = Math.ceil((entry.windowStart + WINDOW - now) / 1000);
        throw new ApiError(
            429,
            `Too many resume generation requests. Please try again in ${resetTime} seconds.`
        );
    }

    // Increment counter
    entry.count++;
    next();
};

/**
 * Rate limiting middleware for resume saving
 * Limits each user to multiple saves per minute (more lenient than generation)
 */
export const resumeSaveRateLimit = (req, res, next) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const key = `resume_save:${userId}`;
    const now = Date.now();
    const WINDOW = 60 * 1000; // 1 minute
    const MAX_REQUESTS = 30;

    let entry = rateLimitStore.get(key);

    if (!entry) {
        rateLimitStore.set(key, { count: 1, windowStart: now });
        return next();
    }

    if (now - entry.windowStart > WINDOW) {
        rateLimitStore.set(key, { count: 1, windowStart: now });
        return next();
    }

    if (entry.count >= MAX_REQUESTS) {
        throw new ApiError(
            429,
            `Too many save requests. Please wait before saving again.`
        );
    }

    entry.count++;
    next();
};

/**
 * Cleanup old entries from rate limit store (call periodically)
 * Prevents memory leaks from old entries
 */
export const cleanupRateLimitStore = () => {
    const now = Date.now();
    const CLEANUP_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, entry] of rateLimitStore.entries()) {
        if (now - entry.windowStart > CLEANUP_THRESHOLD) {
            rateLimitStore.delete(key);
        }
    }
};

// Run cleanup every hour
setInterval(cleanupRateLimitStore, 60 * 60 * 1000);
