// Backend configuration for Resume feature
export const RESUME_TEMPLATES = {
    CLASSIC: 'classic',
    MODERN: 'modern',
    MINIMAL: 'minimal',
    CREATIVE: 'creative',
    TECH: 'tech'
};

export const VALID_TEMPLATES = Object.values(RESUME_TEMPLATES);

export const RESUME_FIELD_LIMITS = {
    NAME_MAX: 100,
    NAME_MIN: 2,
    EMAIL_MAX: 254,
    PHONE_MAX: 20,
    LOCATION_MAX: 100,
    HEADLINE_MAX: 150,
    SUMMARY_MAX: 1000,
    ROLE_MAX: 100,
    URL_MAX: 500,
    SKILL_MAX: 50,
    EXPERIENCE_MAX: 5000,
    PROJECT_MAX: 1000
};

export const ATS_CONFIG = {
    EXCELLENT_THRESHOLD: 80,
    GOOD_THRESHOLD: 60,
    ACTION_VERBS: [
        "led", "built", "designed", "developed", "implemented", "optimized", "improved",
        "reduced", "increased", "launched", "delivered", "automated", "created", "managed",
        "coordinated", "established", "initiated", "transformed", "accelerated"
    ],
    STOP_WORDS: new Set([
        "and", "for", "with", "the", "a", "an", "to", "of", "in", "on", "at",
        "role", "engineer", "developer", "job"
    ])
};

export const RATE_LIMIT_CONFIG = {
    GENERATION_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    GENERATION_MAX_REQUESTS: 10,
    SAVE_WINDOW_MS: 60 * 1000, // 1 minute
    SAVE_MAX_REQUESTS: 30
};
