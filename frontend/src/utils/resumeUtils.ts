/**
 * Shared utility functions for resume parsing and validation
 */

export const toString = (value: string | undefined): string => {
    return (typeof value === "string" ? value.trim() : "");
};

export const toStringArray = (value: string[] | string | undefined): string[] => {
    if (Array.isArray(value)) {
        return value.map((item) => toString(item as string)).filter(Boolean);
    }
    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return [];
};

export const parseDuration = (duration: string | undefined): { startDate: string; endDate: string } => {
    const text = toString(duration);
    if (!text) return { startDate: "", endDate: "" };

    const parts = text
        .split(/-|–|to/i)
        .map((p) => p.trim())
        .filter(Boolean);

    if (parts.length >= 2) {
        return { startDate: parts[0], endDate: parts[1] };
    }
    return { startDate: text, endDate: "Present" };
};

export const parseStrengthsInput = (value: string | undefined): Array<{ title: string; detail: string }> => {
    return (value || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [title, ...rest] = line.split("-");
            return {
                title: (title || "").trim(),
                detail: rest.join("-").trim()
            };
        })
        .filter((item) => item.title || item.detail);
};

export const parseLanguagesInput = (value: string | undefined): Array<{ name: string; level: string }> => {
    return (value || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [name, ...rest] = line.split("-");
            return {
                name: (name || "").trim(),
                level: rest.join("-").trim()
            };
        })
        .filter((item) => item.name || item.level);
};

/**
 * Normalize profile URL to include https:// protocol
 */
export const normalizeProfileUrl = (value: string | undefined): string => {
    const trimmed = (value || "").trim();
    if (!trimmed) return "";
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

/**
 * Validate LinkedIn URL format
 */
export const validateLinkedInUrl = (value: string | undefined): string => {
    if (!value?.trim()) return "";

    try {
        const parsed = new URL(normalizeProfileUrl(value));
        const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
        const path = parsed.pathname.replace(/\/+$/, "");

        if (host !== "linkedin.com" || !/^\/in\/[^/]+$/i.test(path)) {
            return "Enter a valid LinkedIn profile URL (e.g., linkedin.com/in/username).";
        }

        return "";
    } catch {
        return "Enter a valid LinkedIn profile URL (e.g., linkedin.com/in/username).";
    }
};

/**
 * Validate GitHub URL format
 */
export const validateGithubUrl = (value: string | undefined): string => {
    if (!value?.trim()) return "";

    try {
        const parsed = new URL(normalizeProfileUrl(value));
        const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
        const path = parsed.pathname.replace(/\/+$/, "");

        if (host !== "github.com" || !/^\/[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(path)) {
            return "Enter a valid GitHub profile URL (e.g., github.com/username).";
        }

        return "";
    } catch {
        return "Enter a valid GitHub profile URL (e.g., github.com/username).";
    }
};

/**
 * Combined validation and normalization for profile URLs
 */
export const normalizeAndValidateUrl = (
    value: string | undefined,
    type: "linkedin" | "github"
): { url: string; error: string } => {
    const trimmed = (value || "").trim();
    if (!trimmed) return { url: "", error: "" };

    const normalized = normalizeProfileUrl(trimmed);
    const error = type === "linkedin"
        ? validateLinkedInUrl(normalized)
        : validateGithubUrl(normalized);

    return { url: normalized, error };
};

/**
 * Convert language level to dots (for visual representation)
 */
export const dotsForLevel = (level: string | undefined): number => {
    const value = (level || "").toLowerCase();
    if (value.includes("native") || value.includes("fluent")) return 5;
    if (value.includes("advanced")) return 4;
    if (value.includes("intermediate")) return 3;
    if (value.includes("basic") || value.includes("beginner")) return 2;
    return 3;
};

/**
 * Extract keywords from text for ATS scoring
 */
export const toKeywordSet = (text: string, stopWords: Set<string>): Set<string> => {
    return new Set(
        (text || "")
            .toLowerCase()
            .split(/[^a-z0-9+#.]+/)
            .map((token) => token.trim())
            .filter((token) => token.length >= 3 && !stopWords.has(token))
    );
};

/**
 * Count words in text
 */
export const wordCount = (text: string | undefined): number => {
    return (text || "").trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Sanitize HTML to prevent XSS attacks
 * Simple implementation - for production use DOMPurify
 */
export const sanitizeText = (text: string | undefined): string => {
    if (!text) return "";

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
};
